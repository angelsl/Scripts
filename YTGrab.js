/*global escape, unescape, alert, window, document */
(function(){
var s, title, urlmap, urls, _maxFmt, _maxUri, url, _c, _fmt, Url, n, finalresult;

Url = {
 
	// public method for url encoding
	encode : function (string) {
		return escape(this._utf8_encode(string));
	},
 
	// public method for url decoding
	decode : function (string) {
		return this._utf8_decode(unescape(string));
	},
 
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
        var n;
		var utftext = "";
 
		for (n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c, c1, c2, c3;
        c = c1 = c2 = c3 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
 
};

String.prototype.fscape = function() {
    return this.replace(/(\\|\/|\:|\*|\?|\"|<|>|\|)/g, " ");
};

String.prototype.between = function(left, right) {
    var _a1 = this.split(left);
    if(_a1.length < 2) { return false; }
    var _a2 = _a1[1].split(right);
    if(_a2.length < 2) { return false; }
    return _a2[0];
};

s = document.getElementsByTagName('html')[0].innerHTML;
title = s.between("'VIDEO_TITLE': '", "',");
if(!title) { title = s.between("name=\"title\" content=\"", "\""); }
if(!title) { title = s.between("&title=", "&"); }
if(!title) {
    alert("Failed to get video title.");
    return false;
}
s = document.getElementsByTagName('embed')[0].getAttribute("flashvars");
urlmap = s.between("&fmt_url_map=", "&");
if(!urlmap) {
    alert("Failed to get FLV URL.");
    return false;
}
urlmap = Url.decode(urlmap);
urls = urlmap.split(",");
_maxFmt = 0;
_maxUri = false;
for(n = 0; n < urls.length; n++)
{
    url = urls[n];
    _c = url.split("|");
    _fmt = parseInt(_c[0], 10);
    if(isNaN(_fmt)) { continue; }
    if(_fmt <= _maxFmt) { continue; }
    _maxFmt = _fmt;
    _maxUri = _c[1];
}
if(!_maxUri) {
alert("Failed to get URL!");
return false;
}

finalresult = _maxUri+"&title="+Url.encode(title.fscape());
window.location = finalresult;
return false;
}());
