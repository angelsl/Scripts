// ==UserScript==
// @name          theportalwiki.com voice lines embed
// @namespace     https://github.com/angelsl/misc-Greasemonkey
// @description	  Inserts a HTML5 <audio> tag into the page if a WAV link is clicked on TPW's Voice lines
// @include       http://theportalwiki.com/wiki/*_voice_lines*
// @require       https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js
// @require       http://jquery.malsup.com/media/jquery.media.js?v.92
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

var testRegx = /.*wav(?:\?.+)?$/i;
var currentElem = null;
$.fn.media.mapFormat('wav', 'winmedia');
$("a").filter(function() { return testRegx.test($(this).attr('href')); }).click(function(e) 
    {
        e.preventDefault(); if(this == currentElem) return; currentElem = this;
        $("#sltpwvle117").slideUp('fast', function() { $(this).remove(); });
        $("#sltpwvle343").removeAttr("id").slideDown('fast');
        var c = $(this);
        var y = c.clone();
        c.attr("id", "sltpwvle343").slideUp('fast');
        var x = $("<div id=\"sltpwvle117\" style=\"display:none;\"></div>").append(y);
        y.media({ width: "100%", height: 70, autoplay: true, params: {volume:"100"} }); 
        c.after(x); x.slideDown('fast');
    });
