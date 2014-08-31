/** Originally written by angelsl
 With contributions from Manish Burman http://mburman.com
 With contributions from LouCypher https://github.com/LouCypher

 YTGrab is distributed under the GNU LGPL v3 or later and comes with no warranty.
 Full preamble at https://github.com/angelsl/misc-Scripts/blob/master/Greasemonkey/LICENSE.md#ytgrab

// ==UserScript==
// @name          YouTube Download Button
// @namespace     https://github.com/angelsl/misc-Scripts
// @description   Inserts a download button on YouTube video pages
// @version       1.75.2
// @run-at        document-end
// @updateURL     https://github.com/angelsl/misc-Scripts/raw/master/Greasemonkey/YTGrab.user.js
// @downloadURL   https://github.com/angelsl/misc-Scripts/raw/master/Greasemonkey/YTGrab.user.js
// @include       https://www.youtube.com/watch*
// @include       http://www.youtube.com/watch*
// @require       https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js
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
        title = encodeURIComponent($('meta[name=title]').attr("content").replace(/[\/\\\:\*\?\"<\>\|]/g, "")),
        fmtrgx = /^[\-\w+]+\/(?:x-)?([\-\w+]+)/,
        fmt_map = {}, idx, idz, n, a, qual, fmt, fmt_list, map, uefmss, dashlist, ul, q, div;

    fmt_list = uwyca.fmt_list.split(",");
    for (idx = 0; idx < fmt_list.length; idx++) {
        a = fmt_list[idx].split("/");
        fmt_map[a[0]] = a[1].split("x")[1] + "p";
    }

    map = {"1080p": [], "720p": [], "480p": [], "360p": [], "240p": [], "144p": [], "Audio": [], "Unknown": []};
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
            qual = n.type.indexOf("audio/") === 0 ? "Audio" : (n.itag in fmt_map) ? (fmt_map[n.itag]) : (("size" in n) ? (n.size.split('x')[1] + 'p') : ("Unknown"));

            if (!(qual in map)) { map[qual] = []; }
            fmt = fmtrgx.exec(n.type);
            map[qual].push($("<a>DASH" + (fmt ? fmt[1] : "MISSINGNO.").toUpperCase() + "</a>").attr("href", n.url + ((n.url.indexOf("signature=") !== -1) ? "" : ("&signature=" + (n.sig || decipher(n.s)))) + "&title=" + title).attr("title", "Format ID: " + n.itag + " | Bitrate: " + n.bitrate + " | Mime: " + n.type));
        }
    }

    ul = $("<ul class=\"watch-extras-section\" />");
    for (q in map) {
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
}

if (typeof unsafeWindow.ytplayer !== 'undefined')
    { GM_xmlhttpRequest({method: "GET", url: unsafeWindow.ytplayer.config.assets.js.replace(/^\/\//, "https://"), onload: function (t) { main((function (u) {
        "use strict"; var sres = /function ([a-zA-Z$0-9]+)\(a\)\{a=a\.split\(""\);([a-zA-Z0-9]*)\.?.*?return a\.join\(""\)\};/g.exec(u);
        if (!sres) { return function (v) { return v; }; }
        return eval("(function(s){" + (sres[2] !== "" ? (new RegExp("var " + sres[2] + "={.+?}};", "g").exec(u)[0]) : "") + sres[0] + "return " + sres[1] + "(s);})");
    }(t.responseText))); }}); }

