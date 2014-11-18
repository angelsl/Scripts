/** Originally written by angelsl
 With contributions from Manish Burman http://mburman.com
 With contributions from LouCypher https://github.com/LouCypher

 YTGrab is distributed under the GNU LGPL v3 or later and comes with no warranty.
 Full preamble at https://github.com/angelsl/misc-Scripts/blob/master/Greasemonkey/LICENSE.md#ytgrab

// ==UserScript==
// @name          YouTube Download Button
// @namespace     https://github.com/angelsl/misc-Scripts
// @description   Inserts a download button on YouTube video pages
// @version       1.76.1
// @run-at        document-end
// @updateURL     https://github.com/angelsl/misc-Scripts/raw/master/Greasemonkey/YTGrab.user.js
// @downloadURL   https://github.com/angelsl/misc-Scripts/raw/master/Greasemonkey/YTGrab.user.js
// @include       https://www.youtube.com/*
// @include       http://www.youtube.com/*
// @require       https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js
// @require       https://gist.githubusercontent.com/angelsl/347fa95f00bb11c8eef3/raw/fd02ec05e3079cdd52cf5892a7ba27b67b6b6131/waitForKeyElements.js
// @grant         GM_xmlhttpRequest
// @grant         unsafeWindow
// ==/UserScript==
 */

if (typeof unsafeWindow === 'undefined' || typeof unsafeWindow.ytplayer === 'undefined') {
    var p = document.createElement('p');
    p.setAttribute('onclick', 'return window;');
    unsafeWindow = p.onclick();
}

function main(decipher) {
	var dashmpd = unsafeWindow.ytplayer.config.args.dashmpd, mpbsrgx = /\/s\/([\w\.]+)/, mpbs;
	if (typeof dashmpd !== 'undefined') {
		mpbs = mpbsrgx.exec(dashmpd); if(mpbs) dashmpd = dashmpd.replace(mpbsrgx, "/signature/"+decipher(mpbs[1]));
		GM_xmlhttpRequest({method: "GET", url: dashmpd, onload: function (t) { main2(t.responseText, decipher); }});
	} else main2(false, decipher);
}

function main2(dashmpd, decipher) {
    "use strict";
    var
        uriencToMap = function (s) {
            var n = {}, a = s.split("&"), idy, c;
            for (idy = 0; idy < a.length; idy++) {
                c = a[idy].split("=");
                n[c[0]] = decodeURIComponent(c[1]);
            }
            return n;
        },
        uwyca = unsafeWindow.ytplayer.config.args,
        title = uwyca.title.replace(/[\/\\\:\*\?\"<\>\|]/g, ""),
        fmtrgx = /^[\-\w+]+\/(?:x-)?([\-\w+]+)/, 
        fmt_map = {}, idx, idz, n, a, qual, fmt, fmt_list, map, uefmss, dashlist, ul, q, div,
		type, itag, maporder, fpsa, fpsb, fpsw = false;

    fmt_list = uwyca.fmt_list.split(",");
    for (idx = 0; idx < fmt_list.length; idx++) {
        a = fmt_list[idx].split("/");
        fmt_map[a[0]] = a[1].split("x")[1] + "p";
    }

    map = {};
    uefmss = uwyca.url_encoded_fmt_stream_map.split(",");
    for (idx = 0; idx < uefmss.length; idx++) {
        n = uriencToMap(uefmss[idx]);
        qual = fmt_map[n.itag];

        if (!(qual in map)) { map[qual] = []; }
        fmt = fmtrgx.exec(n.type);
        map[qual].push($("<a>" + (fmt ? fmt[1] : "MISSINGNO.").toUpperCase() + "</a>").attr("href", n.url + ((n.url.indexOf("signature=") !== -1) ? "" : ("&signature=" + (n.sig || decipher(n.s)))) + "&title=" + title).attr("title", "Format ID: " + n.itag + " | Quality: " + n.quality + " | Mime: " + n.type));
    }

    dashlist = uwyca.adaptive_fmts;
    if (typeof dashlist !== 'undefined') {
        dashlist = dashlist.split(",");
        for (idx = 0; idx < dashlist.length; idx++) {
            n = uriencToMap(dashlist[idx]);
            qual = n.type.indexOf("audio/") === 0 ? "Audio" : (("size" in n) ? (n.size.split('x')[1] + 'p' + n.fps) : (n.itag in fmt_map) ? (fmt_map[n.itag]) : ("Unknown"));

            if (!(qual in map)) { map[qual] = []; }
            fmt = fmtrgx.exec(n.type);
			if (parseInt(n.fps) == 1) fpsw = 1;
            map[qual].push($("<a>DASH" + (fmt ? fmt[1] : "MISSINGNO.").toUpperCase() + "</a>").attr("href", n.url + ((n.url.indexOf("signature=") !== -1) ? "" : ("&signature=" + (n.sig || decipher(n.s)))) + "&title=" + title).attr("title", "Format ID: " + n.itag + " | Bitrate: " + n.bitrate + " | Mime: " + n.type  + " | Res: " + n.size + " | FPS: " + n.fps));
        }
    }
	
	if (dashmpd !== false) {
		dashmpd = $($.parseXML(dashmpd));
		dashmpd.find("AdaptationSet").each(function() {
			q = $(this); type = q.attr("mimeType");
			q.children("Representation").each(function() {
				n = $(this); itag = n.attr("id");
				qual = type.indexOf("audio/") === 0 ? "Audio" : (n.attr("height") + 'p' + n.attr("frameRate"));
				if (!(qual in map)) { map[qual] = []; }
				fmt = fmtrgx.exec(type);
				if (parseInt(n.attr("frameRate")) == 1) fpsw = 1;
				map[qual].push($("<a>MPD" + (fmt ? fmt[1] : "MISSINGNO.").toUpperCase() + "</a>").attr("href", n.children("BaseURL").text() + "&title=" + title).attr("title", "Format ID: " + itag + " | Bitrate: " + n.attr("bandwidth") + " | Mime: " + type + (type.indexOf("audio/") === 0 ? " | Sample Rate: " + n.attr("audioSamplingRate") : " | Res: " + n.attr("width") + 'x' + n.attr("height") + " | FPS: " + n.attr("frameRate"))));
			});
		});
	}

	maporder = Object.keys(map);
	maporder.sort(function(a,b) {
		if((a == "Audio" && b == "Unknown") || (b == "Audio" && a != "Unknown")) return -1;
		if ((b == "Audio" && a == "Unknown") || (a == "Audio" && b != "Unknown")) return 1;
		fpsa = a.split('p')[1] || 0; fpsb = b.split('p')[1] || 0; if (fpsa != fpsb) return parseInt(fpsb)-parseInt(fpsa);
		return parseInt(b)-parseInt(a); });
    ul = $("<ul class=\"watch-extras-section\" />");
    for (n = 0; n < maporder.length; ++n) {
		q = maporder[n];
        if (map[q].length < 1) { continue; }
        div = $("<div class=\"content\" />").append(map[q][0]);
        for (idz = 1; idz < map[q].length; idz++) {
            div.append(" ").append(map[q][idz]);
        }
        ul.append($("<li><h4 class=\"title\" style=\"font-weight: bold; color: #333333;\">" + q + "</h4></li>").append(div));
    }

    $("#action-panel-share").after($("<div id=\"action-panel-sldownload\" class=\"action-panel-content hid\" data-panel-loaded=\"true\" />").append(ul));
    if(!$("#watch8-secondary-actions").find("> span").eq(0).after($('<span><button class="yt-uix-button yt-uix-button-size-default yt-uix-button-opacity action-panel-trigger yt-uix-button-opacity yt-uix-tooltip" type="button" onclick=";return false;" title="" data-trigger-for="action-panel-sldownload" data-button-toggle="true"><span class="yt-uix-button-content">Download</span></button></span>')).size())
        $("#watch7-secondary-actions").find("> span").eq(1).after($("<span><button role=\"button\" data-trigger-for=\"action-panel-sldownload\" data-button-toggle=\"true\" onclick=\";return false;\" class=\"action-panel-trigger yt-uix-button yt-uix-button-text yt-uix-button-size-default\" type=\"button\"><span class=\"yt-uix-button-content\">Download </span></button></span>"));
	if (fpsw) ul.after($("<p>You may notice that some videos have a reported FPS of 1. This is not a bug with YTGrab; YouTube is reporting this value. The actual files have a proper FPS.</p>"));
}

function run() {
	if (typeof unsafeWindow.ytplayer !== 'undefined')
		{ GM_xmlhttpRequest({method: "GET", url: unsafeWindow.ytplayer.config.assets.js.replace(/^\/\//, "https://"), onload: function (t) { main((function (u) {
			"use strict"; var sres = /function ([a-zA-Z$0-9]+)\(a\)\{a=a\.split\(""\);([a-zA-Z0-9]*)\.?.*?return a\.join\(""\)\};/g.exec(u);
			if (!sres) { return function (v) { return v; }; }
			return eval("(function(s){" + (sres[2] !== "" ? (new RegExp("var " + sres[2] + "={.+?}};", "g").exec(u)[0]) : "") + sres[0] + "return " + sres[1] + "(s);})");
		}(t.responseText))); }}); }
}

waitForKeyElements("#watch8-secondary-actions", run);
