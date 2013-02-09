#!/usr/bin/env python
from google.appengine.ext import db

class DBAL(object):
    @staticmethod
    def get_latest_poll(devicename):
        try:
            return PollResult.gql("WHERE deviceid = :1 ORDER BY time DESC", devicename).get()
        except:
            return None
        
    @staticmethod
    def get_latest_change(devicename):
        try:
            return ArchivedPollResult.gql("WHERE deviceid = :1 ORDER BY time DESC", devicename).get()
        except:
            return None
        
    @staticmethod
    def get_polls(devicename):
        try:
            return PollResult.gql("WHERE deviceid = :1 ORDER BY time DESC LIMIT 25", devicename)
        except:
            return None
        
    @staticmethod
    def get_changes(devicename):
        try:
            return ArchivedPollResult.gql("WHERE deviceid = :1 ORDER BY time DESC LIMIT 25", devicename)
        except:
            return None

class PollResult(db.Model):
    deviceid = db.StringProperty()
    time = db.DateTimeProperty(auto_now_add=True)
    error = db.StringProperty(multiline=True)
    otaname = db.StringProperty()
    otadesc = db.StringProperty(multiline=True)
    otachecksum = db.StringProperty()
    otaurl = db.StringProperty()
    
class ArchivedPollResult(PollResult):
    pass
