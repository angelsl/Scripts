/*global alert, window, document, decodeURIComponent, encodeURIComponent, XPathResult */
(function(){
    
    // define all variables here to satisfy jslint
    var title, urlmap, urls, _maxFmt, _maxUri, _c, _fmt, n;

    String.prototype.between = function(left, right) {
        var _a1, _a2;
        _a1 = this.split(left);
        if(_a1.length < 2) { return false; }
        _a2 = _a1[1].split(right);
        if(_a2.length < 2) { return false; }
        return _a2[0];
    };
   
    title = document.evaluate("//span[@id='eow-title']/attribute::title", document, null, XPathResult.STRING_TYPE, null).stringValue;
    /*if(!title) { title = document.evaluate("//meta[@name='title']/attribute::content", document, null, XPathResult.STRING_TYPE, null).stringValue; }
    if(!title) { title = document.evaluate("/html/head/meta[@property='og:title']/attribute::content", document, null, XPathResult.STRING_TYPE, null).stringValue; } // alternative 1
    if(!title) { title = decodeURIComponent(s.between("&amp;title=", "&")); } // alternative 2
    if(!title) { title = s.between("'VIDEO_TITLE': '", "',"); } // alternative 3*/ // alternatives, uncomment if the first (which shouldn't break..) breaks
    if(!title) {
        return;
    }
    urlmap = document.getElementsByTagName('embed')[0].getAttribute("flashvars").between("&fmt_url_map=", "&");
    if(!urlmap) {
        return;
    }
    urls = decodeURIComponent(urlmap).split(",");
    _maxFmt = 0;
    _maxUri = false;
    for(n = 0; n < urls.length; n++) {
        _c = urls[n].split("|");
        _fmt = parseInt(_c[0], 10);
        if(isNaN(_fmt) || _fmt <= _maxFmt) { continue; }
        _maxFmt = _fmt;
        _maxUri = _c[1];
    }
    if(!_maxUri) {
        return;
    }
    window.location = _maxUri+"&title="+encodeURIComponent(title);
    return;
}());
