#!/usr/bin/python

import datetime
import json

import db
import myserver


class Comments(myserver.Handler):
  def get(self, listing_id):
    session = db.GetSession()
    listing_id = long(listing_id)
    q = session.query(db.Comment).filter(db.Comment.listing_id == listing_id)
    self.response.headers['content-type'] = 'application/json'
    self.response.write(json.dumps([comment.ToDict() for comment in q], sort_keys=True))

  def post(self, listing_id):
    session = db.GetSession()
    listing_id = long(listing_id)
    data = self.request.post_data
    comment = db.Comment(listing_id=listing_id, user=data['user'], comment=data['comment'])
    session.add(comment)
    session.commit()
    self.response.headers['content-type'] = 'application/json'
    self.response.write(json.dumps({'id': comment.id}))


class Listing(myserver.Handler):
  def get(self, listing_id):
    session = db.GetSession()
    listing_id = long(listing_id)
    listing = session.query(db.Listing).filter(db.Listing.id == listing_id).first()
    if listing is None:
      self.response.code = 404
      return
    self.response.headers['content-type'] = 'application/json'
    self.response.write(json.dumps(listing.ToDict(), sort_keys=True))

  def delete(self, listing_id):
    session = db.GetSession()
    listing_id = long(listing_id)
    session.query(db.Comment).filter(db.Comment.listing_id == listing_id).delete()
    session.query(db.Listing).filter(db.Listing.id == listing_id).delete()
    session.commit()

  def put(self, listing_id):
    session = db.GetSession()
    listing_id = long(listing_id)
    data = self.request.post_data
    listing = db.Listing(id=listing_id, user=data['user'], title=data['title'],
                         description=data['description'], expiration=data['expiration'],
                         x=data['location']['x'], y=data['location']['y'])
    session.merge(listing)
    session.commit()
    self.response.headers['content-type'] = 'application/json'
    self.response.write(json.dumps({'id': listing.id}))


class Listings(myserver.Handler):
  def get(self):
    session = db.GetSession()

    q = session.query(db.Listing)

    if self.request.params.get('active') == '1':
      q = q.filter(db.Listing.expiration >= datetime.datetime.utcnow().isoformat())

    radius = float(self.request.params.get('radius', 0))
    if radius:
      x = float(self.request.params.get('x', 0))
      y = float(self.request.params.get('y', 0))
      q = q.filter((db.Listing.x - x) * (db.Listing.x - x) +
                   (db.Listing.y - y) * (db.Listing.y - y) <= radius ** 2)

    length = long(self.request.params.get('length', 0))
    if length:
      q = q.limit(length)

      page = long(self.request.params.get('page', 0))
      if page:
        q = q.offset(page * length)

    self.response.headers['content-type'] = 'application/json'
    self.response.write(json.dumps([listing.ToDict() for listing in q], sort_keys=True))

  def delete(self):
    session = db.GetSession()
    session.query(db.Comment).delete()
    session.query(db.Listing).delete()
    session.commit()

  def post(self):
    session = db.GetSession()
    data = self.request.post_data
    listing = db.Listing(user=data['user'], title=data['title'], description=data['description'],
                         expiration=data['expiration'], x=data['location']['x'],
                         y=data['location']['y'])
    session.add(listing)
    session.commit()
    self.response.headers['content-type'] = 'application/json'
    self.response.write(json.dumps({'id': listing.id}))


if __name__ == '__main__':
  server = myserver.HTTPServer((
          ('/api/listings/([0-9]+)/comments/?$', Comments),
          ('/api/listings/([0-9]+)/?$', Listing),
          ('/api/listings/?$', Listings),
      ), port=9090)
  print 'Now serving on port 9090.'
  server.serve_forever()
