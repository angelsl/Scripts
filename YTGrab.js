/*global alert, window, document, decodeURIComponent, encodeURIComponent, XPathResult */
(function(){
    
    // define all variables here to satisfy jslint
    var title = document.evaluate("//span[@id='eow-title']/attribute::title", document, null, 2, null).stringValue, urlmap = /&fmt_url_map=(.+?)&/i.exec(document.getElementsByTagName('embed')[0].getAttribute("flashvars"))[1], urls, _maxFmt = 0, _maxUri = !1, _c, _fmt, n;
    /*if(!title) { title = document.evaluate("//meta[@name='title']/attribute::content", document, null, XPathResult.STRING_TYPE, null).stringValue; }
    if(!title) { title = document.evaluate("/html/head/meta[@property='og:title']/attribute::content", document, null, XPathResult.STRING_TYPE, null).stringValue; } // alternative 1
    if(!title) { title = decodeURIComponent(s.between("&amp;title=", "&")); } // alternative 2
    if(!title) { title = s.between("'VIDEO_TITLE': '", "',"); } // alternative 3*/ // alternatives, uncomment if the first (which shouldn't break..) breaks
    if(title && urlmap) {
        urls = decodeURIComponent(urlmap).split(",");
        for(n in urls) {
            _c = urls[n].split("|");
            _fmt = parseInt(_c[0], 10);
            if(!isNaN(_fmt) && _fmt > _maxFmt) {
                _maxFmt = _fmt;
                _maxUri = _c[1]; 
            }
        }
        if(_maxUri) window.location = _maxUri+"&title="+encodeURIComponent(title);
    }
}());
