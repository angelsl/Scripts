// ==UserScript==
// @name          Dailymotion Download Button
// @namespace     https://github.com/angelsl/misc-Scripts
// @description	  Inserts a download button on Dailymotion video pages
// @version       1.0
// @include       http://www.dailymotion.com/video/*
// @include       https://www.dailymotion.com/video/*
// @require       https://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js
// ==/UserScript==
/* 
	Copyright (C) 2012 angelsl

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
var url = "#";
var param = eval(decodeURIComponent(window.wrappedJSObject.flashvars.sequence))[0].layerList[0].sequenceList[1].layerList.filter(function(x) { return x.name.toLowerCase() == "video"; })[0].param;
if(typeof param.hqURL !== 'undefined') url = param.hqURL;
else if(typeof param.sdURL !== 'undefined') url = param.sdURL;
else if(typeof param.ldURL !== 'undefined') url = param.ldURL;
else return;
$("#addto").parent().after("<li><a class=\"button\" href=\"" + url + "\" title=\"Use save link as...\">Download</a></li>");
})();