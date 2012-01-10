// ==UserScript==
// @name          YouTube Download Button
// @namespace     https://github.com/angelsl/misc-Greasemonkey
// @description	  Inserts a download button on YouTube video pages
// @version       1.1
// @include       http://www.youtube.com/watch*
// @require       https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js
// ==/UserScript==
/* 
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

(function(){
var title = $('meta[name=title]').attr("content");
var map = processURLMap();
var ul = $("<ul style=\"list-style: disc inside none !important;\" />");
for(var q in map) {
	var li = $("<li><strong>"+q+"</strong> &mdash;</li>");
	for(var idx = 0; idx < map[q].length; idx++) {
		li.append(" ").append(map[q][idx]);
	}
	ul.append(li);
}

var container = $("<div id=\"angelsl-download-area-container\" style=\"height: auto; margin-bottom: 10px; display: none;\" />").append($("<div class=\"yt-rounded\" id=\"angelsl-download-area\" style=\"background: none repeat scroll 0 0 #FFFFFF; border: 0 none; border-radius: 3px 3px 3px 3px; padding:10px; box-shadow: 0 1px 1px #CCCCCC;\" />").append("<strong>Download</strong>").append(ul)).insertBefore($("#watch-info"));
$("#watch-share").after($("<button data-tooltip-text=\"Download this video\" onclick=\";return false;\" title=\"Download this video\" type=\"button\" class=\"yt-uix-tooltip-reverse yt-uix-button yt-uix-tooltip\" id=\"watch-angelsl-download\" role=\"button\"><span class=\"yt-uix-button-content\">Download</span></button>")
    .click( function(eo)
            {
                eo.preventDefault();
                container.slideToggle("fast");
            }));

function processURLMap() {
    var regx = window.wrappedJSObject.yt.config_.PLAYER_CONFIG.args.url_encoded_fmt_stream_map.split(",");
    var ret = {};
    for(var idx = 0; idx < regx.length; idx++) {
        var n = stringToDict(regx[idx]);
		var q = getQuality(n["quality"]);
        if(!(q in ret)) ret[q] = [];
		ret[q].push(getLink(n));
    }
    return ret;
}

function stringToDict(entry) {
    var ret = {};
    var a = entry.split("&");
    for(var idx = 0; idx < a.length; idx++) {
        var c = a[idx].split("=");
        ret[c[0]] = decodeURIComponent(c[1]);
    }
    return ret;
}

function getLink(entry) {
    var url = entry["url"] + "&title=" + encodeURIComponent(title);
    var tooltip = "Format ID: " + entry["itag"] + " | Quality: " + entry["quality"] + " | Mime: " + entry["type"];
    var desc = getType(entry["type"]).toUpperCase();
    return $("<a href=\"" + url + "\" title=\"" + tooltip + "\">" + desc + "</a>");
}

function getType(etype) {
    var regx = /^[-\w+]+\/(?:x-)?([-\w+]+)/.exec(etype);
    if(!regx) return "MISSINGNO.";
    return regx[1];
}

function getQuality(equality) {
    switch(equality.toLowerCase()) {
        case "hd1080":
            return "1080p";
        case "hd720":
            return "720p";
        case "large":
            return "480p";
        case "medium":
            return "360p";
        case "small":
            return "240p";
    }
    return equality.toLowerCase();
}
})();