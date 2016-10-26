/** Originally written by angelsl
 This script is distributed under the GNU LGPL v3 or later and comes with no warranty.
 Full preamble at https://github.com/angelsl/misc-Scripts/blob/master/Greasemonkey/LICENSE.md#tpw

// ==UserScript==
// @name          theportalwiki.com voice lines embed
// @namespace     https://github.com/angelsl/misc-Greasemonkey
// @description	  Inserts a HTML5 <audio> tag into the page if a WAV link is clicked on TPW's Voice lines
// @include       http://theportalwiki.com/wiki/*_voice_lines*
// @require       https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js
// @require       http://jquery.malsup.com/media/jquery.media.js?v.92
// ==/UserScript==
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
