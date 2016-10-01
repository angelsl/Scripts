/** Originally written by angelsl
 With contributions from Manish Burman http://mburman.com
 With contributions from LouCypher https://github.com/LouCypher

 YTGrab is distributed under the GNU LGPL v3 or later and comes with no warranty.
 Full preamble at https://github.com/angelsl/misc-Scripts/blob/master/Greasemonkey/LICENSE.md#ytgrab

// ==UserScript==
// @name          YouTube Download Button
// @namespace     https://github.com/angelsl/misc-Scripts
// @description   Inserts a download button on YouTube video pages
// @version       2.02
// @run-at        document-end
// @updateURL     https://github.com/angelsl/misc-Scripts/raw/master/Greasemonkey/YTGrab.user.js
// @downloadURL   https://github.com/angelsl/misc-Scripts/raw/master/Greasemonkey/YTGrab.user.js
// @include       https://www.youtube.com/*
// @include       http://www.youtube.com/*
// @require       https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant         GM_xmlhttpRequest
// @grant         unsafeWindow
// ==/UserScript==
 */

if (typeof unsafeWindow === 'undefined' || typeof unsafeWindow.ytplayer === 'undefined') {
    var p = document.createElement('p');
    p.setAttribute('onclick', 'return window;');
    unsafeWindow = p.onclick();
}

/*
The following block of code is adapted from https://github.com/gantt/downloadyoutube

The MIT License (MIT)

Copyright (c) 2014 gantt

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

function findSignatureCode(sourceCode) {
    function findMatch(text, regexp) {
        var matches = text.match(regexp);
        return (matches) ? matches[1] : null;
    }

    function isString(s) {
        return (typeof s === 'string' || s instanceof String);
    }

    function isInteger(n) {
        return (typeof n === 'number' && n % 1 == 0);
    }
    var signatureFunctionName =
        findMatch(sourceCode,
            /\.set\s*\("signature"\s*,\s*([a-zA-Z0-9_$][\w$]*)\(/) || findMatch(sourceCode,
            /\.sig\s*\|\|\s*([a-zA-Z0-9_$][\w$]*)\(/) || findMatch(sourceCode,
            /\.signature\s*=\s*([a-zA-Z_$][\w$]*)\([a-zA-Z_$][\w$]*\)/); //old
    if (signatureFunctionName == null) return [];
    signatureFunctionName = signatureFunctionName.replace('$', '\\$');
    var regCode = new RegExp(signatureFunctionName + '\\s*=\\s*function' +
        '\\s*\\([\\w$]*\\)\\s*{[\\w$]*=[\\w$]*\\.split\\(""\\);(.+);return [\\w$]*\\.join');
    var regCode2 = new RegExp('function \\s*' + signatureFunctionName +
        '\\s*\\([\\w$]*\\)\\s*{[\\w$]*=[\\w$]*\\.split\\(""\\);(.+);return [\\w$]*\\.join');
    var functionCode = findMatch(sourceCode, regCode) || findMatch(sourceCode, regCode2);
    if (functionCode == null) return [];
    var reverseFunctionName = findMatch(sourceCode,
        /([\w$]*)\s*:\s*function\s*\(\s*[\w$]*\s*\)\s*{\s*(?:return\s*)?[\w$]*\.reverse\s*\(\s*\)\s*}/);
    if (reverseFunctionName) reverseFunctionName = reverseFunctionName.replace('$', '\\$');
    var sliceFunctionName = findMatch(sourceCode,
        /([\w$]*)\s*:\s*function\s*\(\s*[\w$]*\s*,\s*[\w$]*\s*\)\s*{\s*(?:return\s*)?[\w$]*\.(?:slice|splice)\(.+\)\s*}/);
    if (sliceFunctionName) sliceFunctionName = sliceFunctionName.replace('$', '\\$');
    var regSlice = new RegExp('\\.(?:' + 'slice' + (sliceFunctionName ? '|' + sliceFunctionName : '') +
        ')\\s*\\(\\s*(?:[a-zA-Z_$][\\w$]*\\s*,)?\\s*([0-9]+)\\s*\\)'); // .slice(5) sau .Hf(a,5)
    var regReverse = new RegExp('\\.(?:' + 'reverse' + (reverseFunctionName ? '|' + reverseFunctionName : '') +
        ')\\s*\\([^\\)]*\\)'); // .reverse() sau .Gf(a,45)
    var regSwap = new RegExp('[\\w$]+\\s*\\(\\s*[\\w$]+\\s*,\\s*([0-9]+)\\s*\\)');
    var regInline = new RegExp('[\\w$]+\\[0\\]\\s*=\\s*[\\w$]+\\[([0-9]+)\\s*%\\s*[\\w$]+\\.length\\]');
    var functionCodePieces = functionCode.split(';');
    var decodeArray = [];
    for (var i = 0; i < functionCodePieces.length; i++) {
        functionCodePieces[i] = functionCodePieces[i].trim();
        var codeLine = functionCodePieces[i];
        if (codeLine.length > 0) {
            var arrSlice = codeLine.match(regSlice);
            var arrReverse = codeLine.match(regReverse);
            if (arrSlice && arrSlice.length >= 2) { // slice
                var slice = parseInt(arrSlice[1], 10);
                if (isInteger(slice)) {
                    decodeArray.push(-slice);
                } else return [];
            } else if (arrReverse && arrReverse.length >= 1) { // reverse
                decodeArray.push(0);
            } else if (codeLine.indexOf('[0]') >= 0) { // inline swap
                if (i + 2 < functionCodePieces.length &&
                    functionCodePieces[i + 1].indexOf('.length') >= 0 &&
                    functionCodePieces[i + 1].indexOf('[0]') >= 0) {
                    var inline = findMatch(functionCodePieces[i + 1], regInline);
                    inline = parseInt(inline, 10);
                    decodeArray.push(inline);
                    i += 2;
                } else return [];
            } else if (codeLine.indexOf(',') >= 0) { // swap
                var swap = findMatch(codeLine, regSwap);
                swap = parseInt(swap, 10);
                if (isInteger(swap) && swap > 0) {
                    decodeArray.push(swap);
                } else return [];
            } else return [];
        }
    }
    
    return decodeArray;
}

function decryptSignature(sig, dec) {
    function swap(a, b) {
        var c = a[0];
        a[0] = a[b % a.length];
        a[b] = c;
        return a
    };

    function decode(sig, arr) { // encoded decryption
        var sigA = sig.split('');
        for (var i = 0; i < arr.length; i++) {
            var act = arr[i];
            sigA = (act > 0) ? swap(sigA, act) : ((act == 0) ? sigA.reverse() : sigA.slice(-act));
        }
        var result = sigA.join('');
        return result;
    }
    if (dec) {
        var sig2 = decode(sig, dec);
        if (sig2) return sig2;
    }
    return sig;
}

// End adapted code

function run() {
    if (typeof unsafeWindow.ytplayer !== 'undefined') {
        GM_xmlhttpRequest({
            method: "GET",
            url: unsafeWindow.ytplayer.config.assets.js.replace(/^\/\//, "https://"),
            onload: function(t) {
                var rules = findSignatureCode(t.responseText);
                if (!rules || rules.length < 1) console.log("failed to get sig decode fn");
                var fn = (function(u) {
                    return decryptSignature(u, rules);
                });
                main(fn);
            }
        });
    }
}

function main(decipher) {
    var dashmpd = unsafeWindow.ytplayer.config.args.dashmpd,
        mpbsrgx = /\/s\/([\w\.]+)/,
        mpbs;
    if (typeof dashmpd !== 'undefined') {
        mpbs = mpbsrgx.exec(dashmpd);
        if (mpbs) dashmpd = dashmpd.replace(mpbsrgx, "/signature/" + decipher(mpbs[1]));
        GM_xmlhttpRequest({
            method: "GET",
            url: dashmpd,
            onload: function(t) {
                main2(t.responseText, decipher);
            }
        });
    } else {
        main2(false, decipher);
    }
}

function main2(dashmpd, decipher) {
    "use strict";
    var
        uriencToMap = function(s) {
            var n = {},
                a = s.split("&"),
                idy, c;
            for (idy = 0; idy < a.length; idy++) {
                c = a[idy].split("=");
                n[c[0]] = decodeURIComponent(c[1]);
            }
            return n;
        },
        uwyca = unsafeWindow.ytplayer.config.args,
        title = uwyca.title.replace(/[\/\\\:\*\?\"<\>\|]/g, ""),
        fmtrgx = /^[\-\w+]+\/(?:x-)?([\-\w+]+)/,
        fmt_map = {},
        idx, idz, n, a, qual, fmt, fmt_list, map, uefmss, dashlist, ul, q, div,
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
        if (!(qual in map)) {
            map[qual] = [];
        }
        fmt = fmtrgx.exec(n.type);
        map[qual].push($("<a>" + (fmt ? fmt[1] : "MISSINGNO.").toUpperCase() + "</a>").attr("href", n.url + ((n.url.indexOf("signature=") !== -1) ? "" : ("&signature=" + (n.sig || decipher(n.s)))) + "&title=" + title).attr("title", "Format ID: " + n.itag + " | Quality: " + n.quality + " | Mime: " + n.type));
    }
    dashlist = uwyca.adaptive_fmts;
    if (typeof dashlist !== 'undefined') {
        dashlist = dashlist.split(",");
        for (idx = 0; idx < dashlist.length; idx++) {
            n = uriencToMap(dashlist[idx]);
            qual = n.type.indexOf("audio/") === 0 ? "Audio" : (("size" in n) ? (n.size.split('x')[1] + 'p' + n.fps) : (n.itag in fmt_map) ? (fmt_map[n.itag]) : ("Unknown"));
            if (!(qual in map)) {
                map[qual] = [];
            }
            fmt = fmtrgx.exec(n.type);
            if (parseInt(n.fps) == 1) fpsw = 1;
            map[qual].push($("<a>DASH" + (fmt ? fmt[1] : "MISSINGNO.").toUpperCase() + "</a>").attr("href", n.url + ((n.url.indexOf("signature=") !== -1) ? "" : ("&signature=" + (n.sig || decipher(n.s)))) + "&title=" + title).attr("title", "Format ID: " + n.itag + " | Bitrate: " + n.bitrate + " | Mime: " + n.type + " | Res: " + n.size + " | FPS: " + n.fps));
        }
    }
    if (dashmpd !== false) {
        dashmpd = $($.parseXML(dashmpd));
        dashmpd.find("AdaptationSet").each(function() {
            q = $(this);
            type = q.attr("mimeType");
            q.children("Representation").each(function() {
                n = $(this);
                itag = n.attr("id");
                qual = type.indexOf("audio/") === 0 ? "Audio" : (n.attr("height") + 'p' + n.attr("frameRate"));
                if (!(qual in map)) {
                    map[qual] = [];
                }
                fmt = fmtrgx.exec(type);
                if (parseInt(n.attr("frameRate")) == 1) fpsw = 1;
                map[qual].push($("<a>MPD" + (fmt ? fmt[1] : "MISSINGNO.").toUpperCase() + "</a>").attr("href", n.children("BaseURL").text() + "&title=" + title).attr("title", "Format ID: " + itag + " | Bitrate: " + n.attr("bandwidth") + " | Mime: " + type + (type.indexOf("audio/") === 0 ? " | Sample Rate: " + n.attr("audioSamplingRate") : " | Res: " + n.attr("width") + 'x' + n.attr("height") + " | FPS: " + n.attr("frameRate"))));
            });
        });
    }
    maporder = Object.keys(map);
    maporder.sort(function(a, b) {
        if ((a == "Audio" && b == "Unknown") || (b == "Audio" && a != "Unknown")) return -1;
        if ((b == "Audio" && a == "Unknown") || (a == "Audio" && b != "Unknown")) return 1;
        fpsa = a.split('p')[1] || 0;
        fpsb = b.split('p')[1] || 0;
        if (fpsa != fpsb) return parseInt(fpsb) - parseInt(fpsa);
        return parseInt(b) - parseInt(a);
    });
    ul = $("<ul class=\"watch-extras-section\" />");
    for (n = 0; n < maporder.length; ++n) {
        q = maporder[n];
        if (map[q].length < 1) {
            continue;
        }
        div = $("<div class=\"content\" />").append(map[q][0]);
        for (idz = 1; idz < map[q].length; idz++) {
            div.append(" ").append(map[q][idz]);
        }
        ul.append($("<li><h4 class=\"title\" style=\"font-weight: bold; color: #333333;\">" + q + "</h4></li>").append(div));
    }
    $("#action-panel-share").after($("<div id=\"action-panel-sldownload\" class=\"action-panel-content hid\" data-panel-loaded=\"true\" />").append(ul));
    $("#watch8-secondary-actions").find("> div").eq(1).after($('<button class="yt-uix-button yt-uix-button-size-default yt-uix-button-opacity action-panel-trigger yt-uix-button-opacity yt-uix-tooltip" type="button" onclick=";return false;" title="" data-trigger-for="action-panel-sldownload" data-button-toggle="true"><span class="yt-uix-button-content">Download</span></button>')).size();
    if (fpsw) ul.after($("<p>You may notice that some videos have a reported FPS of 1. This is not a bug with YTGrab; YouTube is reporting this value. The actual files have a proper FPS.</p>"));
}

// waitForKeyElements from https://gist.github.com/BrockA/2625891

function waitForKeyElements(selectorTxt, actionFunction) {
    var targetNodes, btargetsFound;
    targetNodes = $(selectorTxt);
    if (targetNodes && targetNodes.length > 0) {
        btargetsFound = true;
        targetNodes.each(function() {
            var jThis = $(this);
            var alreadyFound = jThis.data('alreadyFound') || false;
            if (!alreadyFound) {
                actionFunction(jThis);
                jThis.data('alreadyFound', true);
            }
        });
    } else {
        btargetsFound = false;
    }
    var controlObj = waitForKeyElements.controlObj || {};
    var controlKey = selectorTxt.replace(/[^\w]/g, "_");
    var timeControl = controlObj[controlKey];

    if (!timeControl) {
        timeControl = setInterval(function() {
                waitForKeyElements(selectorTxt, actionFunction);
            },
            300
        );
        controlObj[controlKey] = timeControl;
    }
    waitForKeyElements.controlObj = controlObj;
};
waitForKeyElements("#watch8-secondary-actions", run);