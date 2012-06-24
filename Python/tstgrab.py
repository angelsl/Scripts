#!/usr/bin/env python2

import urllib2
import json
import urlparse
import posixpath
from twisted.internet import reactor, threads

LAYOUT_URL = "http://st.buuuk.in/ipad_layout"

def main():
    print "Getting issue data."
    sections = json.loads(getfromurl(LAYOUT_URL))['sections']
    for section in sections:
        dosection(section)
    
def dosection(section):
    print ''.join(["Processing section ", section['category']])
    pdfbase = section['pdf_url']
    for page in section['pdf_pages']:
        url = ''.join([pdfbase, page])
        print ''.join(["--> ", "Downloading ", url])
        with open(posixpath.basename(urlparse.urlsplit(url)[2]), 'wb') as f:
            f.write(getfromurl(url))
            f.flush()


def getfromurl(url):
    return urllib2.urlopen(url).read()
    
if __name__ == '__main__':
    main()
