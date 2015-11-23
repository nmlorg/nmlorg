#!/usr/bin/python

from google.appengine.ext import ndb


class Listing(ndb.Model):
  user = ndb.StringProperty()
  title = ndb.StringProperty()
  description = ndb.TextProperty()
  expiration = ndb.TextProperty()
  x = ndb.FloatProperty()
  y = ndb.FloatProperty()

  def ToDict(self):
    return {
        'id': self.key.id(),
        'user': self.user,
        'title': self.title,
        'description': self.description,
        'expiration': self.expiration,
        'location': {
            'x': self.x,
            'y': self.y,
        },
    }


class Comment(ndb.Model):
  listing_id = ndb.IntegerProperty()
  user = ndb.StringProperty()
  comment = ndb.TextProperty()

  def ToDict(self):
    return {
        'id': self.key.id(),
        'user': self.user,
        'comment': self.comment,
    }
