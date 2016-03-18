// ==UserScript==
// @name         SG Game Tags
// @namespace    http://steamcommunity.com/id/Ruphine/
// @version      0.2
// @description  Shows some tags of the game in Steamgifts.
// @author       Ruphine

// @match        http://www.steamgifts.com/*

// @require	  https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant		  GM_deleteValue 
// @grant		  GM_getValue 
// @grant		  GM_listValues 
// @grant		  GM_setValue 
// @grant		  GM_xmlhttpRequest
// ==/UserScript==

/* CSS */
var myCSS;
myCSS = '<style> \
		.tags { \
			color: #FFFFFF; \
			text-decoration: none; \
			border-radius: 20px; \
			padding-top: 2px; \
			padding-bottom: 2px; \
			padding-left: 5px; \
			padding-right: 5px; \
			font-size: 8pt; \
			margin-left: 3px; \
			text-shadow: none; \
			display: none; \
		} \
		.tags-green { background-color: #3AA435; } \
		.tags-red { background-color: #f44336; } \
	</style>';

$("head").append(myCSS);


/* Constant Variables */
const linkCard = "http://www.steamcardexchange.net/index.php?inventorygame-appid-";
const linkBundle = "http://www.steamgifts.com/bundle-games/search?q=";

const linkGameAPI = "http://store.steampowered.com/api/appdetails?filters=categories&appids=";
const linkPackAPI = "http://store.steampowered.com/api/packagedetails?filters=categories&packageids=";

const ClassCard = "tags tags-green";
const TitleCard = "This game has trading cards";
const TextCard = "Cards";

const ClassBundle = "tags tags-red";
const TitleBundle = "This game is considered as bundled by Steamgifts";
const TextBundle = "Bundled";

main();

function main()
{
	//shows trading card tag in featured game (header)
	var currLoc = window.location.href.split("/");
	if(currLoc[currLoc.length-2] != "user") //exclude user page for getting featured appID
	{	
		var ID = getAppIDfromImg($(".global__image-outer-wrap img")[0].src);
		if (ID != null) { //if game doesn't have appID e.g Humble Indie Bundle
			var Name = $(".featured__heading__medium").text();
			var target = $(".featured__heading");

			var tagCard = createTag(ClassCard, TitleCard, TextCard, linkCard+ID, target);
			var tagBundle = createTag(ClassBundle, TitleBundle, TextBundle, linkBundle+Name, target);

			getTradingCardStatus(tagCard, ID);
			getBundleStatus(tagBundle, ID, Name);
		}
	}

	//looping for each games shown
	$(".giveaway__row-inner-wrap").each(function(index, element)
	{
		var ID = getAppIDfromLink($("a.giveaway__icon")[index].href);
		if (ID != null) {
			var Name = $($(".giveaway__heading__name")[index]).text();
			var target = $(element).find(".giveaway__heading");

			var tagCard = createTag(ClassCard, TitleCard, TextCard, linkCard+ID, target);
			var tagBundle = createTag(ClassBundle, TitleBundle, TextBundle, linkBundle+Name, target);

			//I assume app will have zero at the end ID, and package is non zero.Need more research.
			if(ID.charAt(ID.length-1) == "0") 
				getTradingCardStatus(tagCard, ID);
			else
				getTradingCardStatusFromPackage(tagCard, ID);
			
			getBundleStatus(tagBundle, ID, Name);
		}
	});
}

function createTag(_class, title, text, href, divTarget)
{
	var tag = document.createElement("a");
	tag.setAttribute("id", "tags");
	tag.setAttribute("target", "_blank");
	tag.setAttribute("class", _class);
	tag.setAttribute("title", title);
	tag.setAttribute("href", href);
	tag.innerHTML = text;

	divTarget.append(tag);

	return tag;
}

function getAppIDfromImg(link)
{
//	http://cdn.akamai.steamstatic.com/steam/apps/269270/header_292x136.jpg
	var url = link.split("/");
	return url[url.length-2];
}

function getAppIDfromLink(link)
{
//	http://store.steampowered.com/app/403570/	
	var url = link.split("/");
	return url[url.length-2];
}

function getTradingCardStatus(elems, appID)
{
	//TODO: Check if the game is saved, if no then request to steam
	GM_xmlhttpRequest({
		method: "GET",
		timeout: 10000,
		url: linkGameAPI+appID,
		onload: function(data) 
		{
			var obj = JSON.parse(data.responseText)[appID].data.categories;
			for(i=0; i<obj.length; i++)
			{
				if(obj[i].id == "29")
				{
					//TODO : Save appID + true ke local cache
					$(elems).css("display", "block");
					break;
				}
			}
		}
	});
}

function getBundleStatus(elems, appID, appName)
{
	//TODO: Check if the game is saved, if no then request to steam
	$.get( linkBundle+appName, function( data ) {
		var gamesfound = $(data).find(".table__column__secondary-link");
		for(i=0; i<$(gamesfound).length; i++)
		{
			var url = $(gamesfound)[i].href;
			var ID = getAppIDfromLink(url);

			if(appID == ID)
			{
				//TODO : Save appID + true ke local cache
				$(elems).css("display", "block");
				break;
			}
		}
		//TODO : Save appID + false + expire time ke local cache
	});
}

function getTradingCardStatusFromPackage(elems, appID) //Need more research
{
	//TODO: Check if the game is saved, if no then request to steam
	GM_xmlhttpRequest({
		method: "GET",
		timeout: 10000,
		url: linkGameAPI+appID,
		onload: function(data) 
		{
			var ID = JSON.parse(data.responseText)[appID].data.apps[0].id;
			getTradingCardStatus(elems, ID);
			//TODO : Save appID + false + expire time ke local cache
		}
	});
}