#!/usr/bin/python

import datetime
import json
import webapp2
from google.appengine.ext import ndb
import db


class Comments(webapp2.RequestHandler):
  def get(self, listing_id):
    listing_id = long(listing_id)
    q = db.Comment.query(db.Comment.listing_id == listing_id)
    self.response.headers['content-type'] = 'application/json'
    self.response.write(json.dumps([comment.ToDict() for comment in q], sort_keys=True))

  def post(self, listing_id):
    listing_id = long(listing_id)
    data = json.loads(self.request.body)
    comment = db.Comment(listing_id=listing_id, user=data['user'], comment=data['comment'])
    comment.put()
    self.response.headers['content-type'] = 'application/json'
    self.response.write(json.dumps({'id': comment.key.id()}))


class Listing(webapp2.RequestHandler):
  def get(self, listing_id):
    listing_id = long(listing_id)
    listing = db.Listing.get_by_id(listing_id)
    if listing is None:
      self.response.code = 404
      return
    self.response.headers['content-type'] = 'application/json'
    self.response.write(json.dumps(listing.ToDict(), sort_keys=True))

  def delete(self, listing_id):
    listing_id = long(listing_id)
    ndb.delete_multi(db.Comment.query(db.Comment.listing_id == listing_id).fetch(keys_only=True))
    ndb.Key(db.Listing, listing_id).delete()

  def put(self, listing_id):
    listing_id = long(listing_id)
    data = json.loads(self.request.body)
    listing = db.Listing(id=listing_id, user=data['user'], title=data['title'],
                         description=data['description'], expiration=data['expiration'],
                         x=data['location']['x'], y=data['location']['y'])
    listing.put()
    self.response.headers['content-type'] = 'application/json'
    self.response.write(json.dumps({'id': listing.key.id()}))


class Listings(webapp2.RequestHandler):
  def get(self):
    q = db.Listing.query()

    if self.request.params.get('active') == '1':
      q = q.filter(db.Listing.expiration >= datetime.datetime.utcnow().isoformat())

    radius = float(self.request.params.get('radius', 0))
    if radius:
      x = float(self.request.params.get('x', 0))
      y = float(self.request.params.get('y', 0))
      q = q.filter((db.Listing.x - x) * (db.Listing.x - x) +
                   (db.Listing.y - y) * (db.Listing.y - y) <= radius ** 2)

    opts = {}
    length = long(self.request.params.get('length', 0))
    if length:
      opts['limit'] = length

      page = long(self.request.params.get('page', 0))
      if page:
        opts['offset'] = page * length

    self.response.headers['content-type'] = 'application/json'
    self.response.write(
        json.dumps([listing.ToDict() for listing in q.fetch(**opts)], sort_keys=True))

  def delete(self):
    ndb.delete_multi(db.Comment.query().fetch(keys_only=True))
    ndb.delete_multi(db.Listing.query().fetch(keys_only=True))

  def post(self):
    content_type = self.request.headers.get('content-type', '').split(';', 1)[0]
    if content_type == 'application/x-www-form-urlencoded':
      data = self.request.POST
    else:
      data = json.loads(self.request.body)
      data['x'] = data['location']['x']
      data['y'] = data['location']['y']
    listing = db.Listing(user=data['user'], title=data['title'], description=data['description'],
                         expiration=data['expiration'], x=float(data['x']), y=float(data['y']))
    listing.put()
    self.response.headers['content-type'] = 'application/json'
    self.response.write(json.dumps({'id': listing.key.id()}))


app = webapp2.WSGIApplication((
        ('/api/listings/([0-9]+)/comments/?$', Comments),
        ('/api/listings/([0-9]+)/?$', Listing),
        ('/api/listings/?$', Listings),
    ))
