#!/usr/bin/env python2

import urllib2
import json
import urlparse
import posixpath
import os
import sys
from datetime import date, timedelta
from pyPdf import PdfFileWriter, PdfFileReader
import threadpool

LAYOUT_URL_ = "http://st.buuuk.in/ipad_layout?day="
verbose = False

def doday(daysago):
    global LAYOUT_URL_
    LAYOUT_URL = LAYOUT_URL_ + str(daysago)
    if verbose: print "Getting issue data from", LAYOUT_URL
    sections = json.loads(getfromurl(LAYOUT_URL))['sections']
    filenames = []
    for section in sections:
        dosection(section, filenames)
    toclose = []
    out = PdfFileWriter()
    if verbose: print 'Retrieving pages'
    for file in filenames:
        f = open(file, 'rb')
        toclose.append(f)
        if verbose: print '--> Adding page(s) from', file
        fpdf = PdfFileReader(f)
        for pdfpg in fpdf.pages:
            out.addPage(pdfpg)
    ofname = ''.join(['ST', (date.today() - timedelta(int(daysago))).strftime('%Y%m%d'), '.pdf'])
    of = open(ofname, 'wb')
    toclose.append(of)
    if verbose: print 'Merging pages'
    out.write(of)
    for f in toclose:
        f.close()
    if verbose: print 'Deleting temporary files'
    for file in filenames:
        if verbose: print '--> Deleting', file
        os.unlink(file)
    print 'Done:', ofname

def dosection(section, filenames):
    if verbose: print "Processing section", section['category']
    pdfbase = section['pdf_url']
    for page in section['pdf_pages']:
        url = ''.join([pdfbase, page])
        if verbose: print "--> Downloading", url
        name = posixpath.basename(urlparse.urlsplit(url)[2])
#        with open(name, 'wb') as f:
            #f.write(getfromurl(url))
            #f.flush()
        filenames.append(name)

def getfromurl(url):
    return urllib2.urlopen(url).read()

if __name__ == '__main__':
    pool = threadpool.ThreadPool(4)
    req = threadpool.makeRequests(doday, xrange(int(sys.argv[1]), int(sys.argv[2])))
    for reqs in req:
        pool.putRequest(reqs)
    pool.wait()
