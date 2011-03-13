/*global alert, window, document, decodeURIComponent, encodeURIComponent, XPathResult */
(function(){
    
    // define all variables here to satisfy jslint
    var title = document.evaluate("//span[@id='eow-title']/attribute::title", document, null, 2, null).stringValue, urlmap = /&fmt_url_map=(.+?)&/i.exec(document.getElementsByTagName('embed')[0].getAttribute("flashvars"))[1], _maxFmt = 0, _maxUri = !1, _fmt, n;
    /*if(!title) { title = document.evaluate("//meta[@name='title']/attribute::content", document, null, XPathResult.STRING_TYPE, null).stringValue; }
    if(!title) { title = document.evaluate("/html/head/meta[@property='og:title']/attribute::content", document, null, XPathResult.STRING_TYPE, null).stringValue; } // alternative 1
    if(!title) { title = decodeURIComponent(s.between("&amp;title=", "&")); } // alternative 2
    if(!title) { title = s.between("'VIDEO_TITLE': '", "',"); } // alternative 3*/ // alternatives, uncomment if the first (which shouldn't break..) breaks
    if(title && urlmap) {
        urlmap = decodeURIComponent(urlmap).split(",");
        for(n in urlmap) {
            n = urlmap[n].split("|");
            _fmt = parseInt(n[0], 10);
            if(!isNaN(_fmt) && _fmt > _maxFmt) {
                _maxFmt = _fmt;
                _maxUri = n[1]; 
            }
        }
        if(_maxUri) window.location = _maxUri+"&title="+encodeURIComponent(title);
    }
}());
