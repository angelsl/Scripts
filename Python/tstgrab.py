#!/usr/bin/env python2

import urllib2
import json
import urlparse
import posixpath
import os
from datetime import date
from pyPdf import PdfFileWriter, PdfFileReader

LAYOUT_URL = "http://st.buuuk.in/ipad_layout"

def main():
    print "Getting issue data from", LAYOUT_URL
    sections = json.loads(getfromurl(LAYOUT_URL))['sections']
    filenames = []
    for section in sections:
        dosection(section, filenames)
    toclose = []
    out = PdfFileWriter()
    print 'Retrieving pages'
    for file in filenames:
        f = open(file, 'rb')
        toclose.append(f)
        print '--> Adding page(s) from', file
        fpdf = PdfFileReader(f)
        for pdfpg in fpdf.pages:
            out.addPage(pdfpg)
    ofname = ''.join(['ST', date.today().strftime('%Y%m%d'), '.pdf'])
    of = open(ofname, 'wb')
    toclose.append(of)
    print 'Merging pages'
    out.write(of)
    for f in toclose:
        f.close()
    print 'Deleting temporary files'
    for file in filenames:
        print '--> Deleting', file
        os.unlink(file)
    print 'Done!', ofname

def dosection(section, filenames):
    print "Processing section", section['category']
    pdfbase = section['pdf_url']
    for page in section['pdf_pages']:
        url = ''.join([pdfbase, page])
        print "--> Downloading", url
        name = posixpath.basename(urlparse.urlsplit(url)[2])
        with open(name, 'wb') as f:
            f.write(getfromurl(url))
            f.flush()
        filenames.append(name)

def getfromurl(url):
    return urllib2.urlopen(url).read()

if __name__ == '__main__':
    main()
