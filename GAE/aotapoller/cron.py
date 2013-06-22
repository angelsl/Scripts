#!/usr/bin/env python
import sys
import os
import httplib
from google.appengine.ext import db
from lxml import etree
from dbal import PollResult,DBAL,ArchivedPollResult

def lenovo(self):
    models = ["LenovoK860", "LenovoK860_ROW", "LenovoK860i", "LenovoK900", "LenovoK900_ROW", "IdeaTabA2109A-F"]
    for model in models:
        lenovo_internal(self, model)

def lenovo_internal(self, model):
    self.response.out.write("Cron: Lenovo FUS ({0})\n".format(model))
    conn = httplib.HTTPConnection("fus.lenovomm.com")
    conn.request("GET", "/firmware/3.0/updateservlet?action=querynewfirmware&devicemodel={0}&locale=".format(model))
    resp = conn.getresponse()
    if resp.status == 200:
        try:
            xml = etree.fromstring(resp.read())
            pr = PollResult(deviceid=model,
                otaname=xml.xpath("/firmwareupdate/firmware/name")[0].text,
                otadesc=lenovo_getdesc(xml),
                otachecksum=xml.xpath("/firmwareupdate/firmware/md5")[0].text,
                otaurl=xml.xpath("/firmwareupdate/firmware/downloadurl")[0].text)
            pr.put()
            lastchange = DBAL.get_latest_change(model)
            if lastchange is None or lastchange.otachecksum != pr.otachecksum or lastchange.otaname != pr.otaname or lastchange.otaurl != pr.otaurl:
                ArchivedPollResult(deviceid=model,
                    otaname=xml.xpath("/firmwareupdate/firmware/name")[0].text,
                    otadesc=lenovo_getdesc(xml),
                    otachecksum=xml.xpath("/firmwareupdate/firmware/md5")[0].text,
                    otaurl=xml.xpath("/firmwareupdate/firmware/downloadurl")[0].text).put()
            return
        except:
            PollResult(deviceid=model,error="{0} {1}".format(sys.exc_info()[0], sys.exc_info()[1])).put()
    else:
        PollResult(deviceid=model,error="{0} {1}".format(resp.status, resp.reason)).put()
    lastchange = DBAL.get_latest_change(model)
    if lastchange is None:
        ArchivedPollResult(deviceid=model, error="No successful polls yet.").put()

def lenovo_getdesc(xml):
    endesc = xml.xpath("/firmwareupdate/firmware/desc_en")
    if len(endesc) == 0:
        return xml.xpath("/firmwareupdate/firmware/desc_cn")[0].text
    else:
        return endesc[0].text
