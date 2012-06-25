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
    print "Getting issue data."
    sections = json.loads(getfromurl(LAYOUT_URL))['sections']
    filenames = []
    for section in sections:
        dosection(section, filenames)
    toclose = []
    out = PdfFileWriter()
    for file in filenames:
        f = open(file, 'rb')
        toclose.append(f)
        print 'Adding pages from', file
        fpdf = PdfFileReader(f)
        for pdfpg in fpdf.pages:
            out.addPage(pdfpg)
    of = open(''.join(['ST', date.today().strftime('%Y%m%d'), '.pdf']), 'wb')
    toclose.append(of)
    out.write(of)
    for f in toclose:
        f.close()
    for file in filenames:
        os.unlink(file)

def dosection(section, filenames):
    print ''.join(["Processing section ", section['category']])
    pdfbase = section['pdf_url']
    for page in section['pdf_pages']:
        url = ''.join([pdfbase, page])
        print ''.join(["--> ", "Downloading ", url])
        name = posixpath.basename(urlparse.urlsplit(url)[2])
        with open(name, 'wb') as f:
            f.write(getfromurl(url))
            f.flush()
        filenames.append(name)

def getfromurl(url):
    return urllib2.urlopen(url).read()

if __name__ == '__main__':
    main()
