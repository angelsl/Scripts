/** Originally written by angelsl
    With contributions from Manish Burman http://mburman.com
    With contributions from LouCypher https://github.com/LouCypher

    YTGrab is distributed under the GNU LGPL v3 or later and comes with no warranty.
    Full preamble at https://github.com/angelsl/misc-Scripts/blob/master/Greasemonkey/LICENSE.md#ytgrab
    
    jQuery v2.1.1 -ajax,-ajax/jsonp,-ajax/load,-ajax/parseJSON,-ajax/parseXML,-ajax/script,-ajax/var/nonce,-ajax/var/rquery,-ajax/xhr,-manipulation/_evalUrl,-deprecated,-dimensions,-effects,-effects/animatedSelector,-effects/Tween,-event,-event/alias,-event/support,-offset,-wrap,-core/ready,-deferred,-exports/amd | (c) 2005, 2014 jQuery Foundation, Inc. | jquery.org/license
    
// ==UserScript==
// @name          YouTube Download Button
// @namespace     https://github.com/angelsl/misc-Scripts
// @description   Inserts a download button on YouTube video pages
// @version       1.71
// @run-at        document-end
// @updateURL     https://github.com/angelsl/misc-Scripts/raw/master/Greasemonkey/Minified/YTGrab.user.js
// @downloadURL   https://github.com/angelsl/misc-Scripts/raw/master/Greasemonkey/Minified/YTGrab.user.js
// @include       https://www.youtube.com/watch*
// @include       http://www.youtube.com/watch*
// @require       https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js
// @grant         GM_xmlhttpRequest 
// ==/UserScript==
*/

if (typeof unsafeWindow === 'undefined' || typeof unsafeWindow.ytplayer === 'undefined') {
        var p = document.createElement('p');
        p.setAttribute('onclick', 'return window;');
        unsafeWindow = p.onclick();
}

if (typeof unsafeWindow.ytplayer !== 'undefined')
GM_xmlhttpRequest({method: "GET", url: unsafeWindow.ytplayer.config.assets.js, onload: function(t) {
    var uriencToMap = function(s) { var n = {}; var a = s.split("&"); 
        for(var idy = 0; idy < a.length; idy++) { var c = a[idy].split("="); n[c[0]] = decodeURIComponent(c[1]); } return n; };
    var sanitiseTitle = function(s) { return s.replace(/[\/\\\:\*\?\"\<\>\|]/g, ""); }
    var fmtrgx = /^[-\w+]+\/(?:x-)?([-\w+]+)/;
    var decipher = (function(u) {
        var sres = /function ([a-zA-Z$0-9]+)\(a\){a=a\.split\(""\);([a-zA-Z0-9]+)\..*?return a\.join\(""\)};/g.exec(u);
        return eval("(function(s){"+new RegExp("var " + sres[2] + "={.+?}};", "g").exec(u)[0]+sres[0]+"return "+sres[1]+"(s);})");
    })(t.responseText);
    var title = $('meta[name=title]').attr("content");
    var fmt_list = unsafeWindow.ytplayer.config.args.fmt_list.split(",");
    var fmt_map = {};
    for(var idx = 0; idx < fmt_list.length; idx++) {
        var a = fmt_list[idx].split("/");
        fmt_map[a[0]] = a[1].split("x")[1] + "p";
    }
    var uefmss = unsafeWindow.ytplayer.config.args.url_encoded_fmt_stream_map.split(",");
    var map = {"1080p": [], "720p": [], "480p": [], "360p": [], "240p": [], "144p": [], "Audio": [], "Unknown": []};
    for(var idx = 0; idx < uefmss.length; idx++) {
        var n = uriencToMap(uefmss[idx]);
        var qual = fmt_map[n["itag"]];

        if(!(qual in map)) map[qual] = [];
        var fmt = fmtrgx.exec(n["type"]);       
        map[qual].push($("<a>" + (fmt?fmt[1]:"MISSINGNO.").toUpperCase() + "</a>").attr("href", n["url"] + ((n["url"].indexOf("signature=")!=-1) ? "" : ("&signature="+(n["sig"]||decipher(n["s"])))) + "&title=" + encodeURIComponent(sanitiseTitle(title))).attr("title", "Format ID: " + n["itag"] + " | Quality: " + n["quality"] + " | Mime: " + n["type"]));
    }
    var dashlist = unsafeWindow.ytplayer.config.args.adaptive_fmts;
    if(typeof dashlist != 'undefined') {
        var dashlist = dashlist.split(",");
        for(var idx = 0; idx < dashlist.length; idx++) {
            var n = uriencToMap(dashlist[idx]);
            var qual = n["type"].indexOf("audio/") == 0 ? "Audio" : (n["itag"] in fmt_map) ? (fmt_map[n["itag"]]) : (("size" in n) ? (n["size"].split('x')[1] + 'p') : ("Unknown"));

            if(!(qual in map)) map[qual] = [];
            var fmt = fmtrgx.exec(n["type"]);
            map[qual].push($("<a>DASH" + (fmt?fmt[1]:"MISSINGNO.").toUpperCase() + "</a>").attr("href", n["url"] + ((n["url"].indexOf("signature=")!=-1) ? "" : ("&signature="+(n["sig"]||decipher(n["s"])))) + "&title=" + encodeURIComponent(sanitiseTitle(title))).attr("title", "Format ID: " + n["itag"] + " | Bitrate: " + n["bitrate"] + " | Mime: " + n["type"]));
        }
    }
    var ul = $("<ul class=\"watch-extras-section\" />");
    for(var q in map) {
        if(map[q].length < 1) continue;
        var div = $("<div class=\"content\" />").append(map[q][0]);
        for(var idz = 1; idz < map[q].length; idz++) {
            div.append(" ").append(map[q][idz]);
        }
        ul.append($("<li><h4 class=\"title\" style=\"font-weight: bold; color: #333333;\">"+q+"</h4></li>").append(div));
    }

    $("#action-panel-share").after($("<div id=\"action-panel-sldownload\" class=\"action-panel-content hid\" data-panel-loaded=\"true\" />").append(ul));
    $("#watch7-secondary-actions > span").eq(1).after($("<span><button role=\"button\" data-trigger-for=\"action-panel-sldownload\" data-button-toggle=\"true\" onclick=\";return false;\" class=\"action-panel-trigger yt-uix-button yt-uix-button-text yt-uix-button-size-default\" type=\"button\"><span class=\"yt-uix-button-content\">Download </span></button></span>"));
}});

