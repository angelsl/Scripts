# JavaScript Bookmarklets

These are the original source to some bookmarklets I've written.

Use [this](http://compressorrater.thruhere.net/) to minify them into something that can be inserted into a bookmark, or...

Bookmark these for:
* [YouTube video grabber](javascript:(function(){var%20g,b,f,e,a,d,c,h;String.prototype.between=function(l,i){var%20k,j;k=this.split(l);if(k.length<2){return%20false}j=k[1].split(i);if(j.length<2){return%20false}return%20j[0]};g=document.evaluate("//span[@id='eow-title']/attribute::title",document,null,XPathResult.STRING_TYPE,null).stringValue;if(!g){return}b=document.getElementsByTagName("embed")[0].getAttribute("flashvars").between("&fmt_url_map=","&");if(!b){return}f=decodeURIComponent(b).split(",");e=0;a=false;for(h=0;h<f.length;h++){d=f[h].split("|");c=parseInt(d[0],10);if(isNaN(c)||c<=e){continue}e=c;a=d[1]}if(!a){return}window.location=a+"&title="+encodeURIComponent(g);return}());)

Enjoy.