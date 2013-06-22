#!/usr/bin/env python
import webapp2
import jinja2
import os
from dbal import DBAL,PollResult,ArchivedPollResult

je = jinja2.Environment(loader=jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), "template")))
devices = {"LenovoK860": "Lenovo K860",
           "LenovoK860_ROW": "Lenovo K860 (ROW)", 
           "LenovoK860i": "Lenovo K860i", 
           "LenovoK900": "Lenovo K900", 
           "LenovoK900_ROW": "Lenovo K900 (ROW)",
           "IdeaTabA2109A-F": "Lenovo IdeaTab A2109"}
           
def show_error(handler, message):
    template = je.get_template('error.html')
    handler.response.out.write(template.render({'error': message}))

class OverviewPage(webapp2.RequestHandler):
    def get(self):
        template = je.get_template('overview.html')
        pagedevices = []
        for id, name in devices.items():
            pagedevices.append({"name": name, "id": id, "change": DBAL.get_latest_change(id), "poll": DBAL.get_latest_poll(id)})
        
        self.response.out.write(template.render({'devices': pagedevices, 'uri_for':self.uri_for}))
        
class DeviceHistoryPage(webapp2.RequestHandler):
    def get(self, deviceidp=None, deviceidc=None):
        deviceid = None
        change = False
        if deviceidp is not None:
            deviceid = deviceidp
        else:
            deviceid = deviceidc
            change = True
        if not deviceid in devices.keys():
            show_error(self, "No such device \"{0}\"; note that paths are case-sensitive!".format(deviceid))
            return
        template = je.get_template('device.html')
        polls = DBAL.get_changes(deviceid) if change else DBAL.get_polls(deviceid)
        self.response.out.write(template.render({"id":deviceid, "name": devices[deviceid], "polls": polls, 'uri_for':self.uri_for, 'change':change}))
        
class OTAPage(webapp2.RequestHandler):
    def get(self, otaid=None, aotaid=None):
        isaota = False
        if aotaid is not None:
            otaid = aotaid
            isaota = True
        if not otaid.isdigit():
            show_error(self, "Invalid poll ID \"{0}\"; non-numeric".format(otaid))
            return
        poll = (ArchivedPollResult if isaota else PollResult).gql("WHERE __key__ = KEY('{1}PollResult', {0})".format(otaid, "Archived" if isaota else "")).get()
        if poll == None:
            show_error(self, "Invalid poll ID \"{0}\"; does not exist".format(otaid))
            return
        template = je.get_template('ota.html')
        
        self.response.out.write(template.render({"poll": poll, "name":devices[poll.deviceid], "change":isaota, 'uri_for':self.uri_for}))

app = webapp2.WSGIApplication([
    webapp2.Route(r'/', handler=OverviewPage, name='overview'),
    webapp2.Route(r'/polls/<deviceidp>', handler=DeviceHistoryPage, name='polls'),
    webapp2.Route(r'/changes/<deviceidc>', handler=DeviceHistoryPage, name='changes'),
    webapp2.Route(r'/ota/<otaid>', handler=OTAPage, name='ota'),
    webapp2.Route(r'/aota/<aotaid>', handler=OTAPage, name='aota'),
], debug=True)

class Cron(webapp2.RequestHandler):
    def get(self):
        import cron
        cron.lenovo(self)

cron = webapp2.WSGIApplication([
    webapp2.Route(r'/cron', handler=Cron, name='cron'),
], debug=True)
