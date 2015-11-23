#!/usr/bin/python

import collections
import datetime
import json
import threading

import myserver


LISTINGS = []
LISTINGS_COMMENTS = collections.defaultdict(list)
LISTINGS_LOCK = threading.Lock()


def GetActive(listings):
  now = datetime.datetime.utcnow().isoformat()
  for listing in listings:
    if listing['expiration'] >= now:
      yield listing


def GetNondeleted(listings):
  for listing in listings:
    if listing is not None:
      yield listing


def FilterByDistanceFrom(listings, x, y, radius):
  radius2 = radius ** 2
  for listing in listings:
    if (listing['location']['x'] - x) ** 2 + (listing['location']['y'] - y) ** 2 <= radius2:
      yield listing


class Comments(myserver.Handler):
  def get(self, listing_id):
    listing_id = long(listing_id)
    with LISTINGS_LOCK:
      if listing_id >= len(LISTINGS) or LISTINGS[listing_id] is None:
        self.response.code = 404
        return
      comments = LISTINGS_COMMENTS[listing_id]
    self.response.headers['content-type'] = 'application/json'
    self.response.write(json.dumps(comments, sort_keys=True))

  def post(self, listing_id):
    listing_id = long(listing_id)
    comment = self.request.post_data
    with LISTINGS_LOCK:
      if listing_id >= len(LISTINGS) or LISTINGS[listing_id] is None:
        self.response.code = 404
        return
      comment['id'] = len(LISTINGS_COMMENTS[listing_id])
      LISTINGS_COMMENTS[listing_id].append(comment)
    self.response.headers['content-type'] = 'application/json'
    self.response.write(json.dumps({'id': comment['id']}))


class Listing(myserver.Handler):
  def get(self, listing_id):
    listing_id = long(listing_id)
    with LISTINGS_LOCK:
      if listing_id >= len(LISTINGS) or LISTINGS[listing_id] is None:
        self.response.code = 404
        return
      listing = LISTINGS[listing_id]
    self.response.headers['content-type'] = 'application/json'
    self.response.write(json.dumps(listing, sort_keys=True))

  def delete(self, listing_id):
    listing_id = long(listing_id)
    with LISTINGS_LOCK:
      if listing_id >= len(LISTINGS) or LISTINGS[listing_id] is None:
        self.response.code = 404
        return
      LISTINGS[listing_id] = None
      LISTINGS_COMMENTS.pop(listing_id, None)

  def put(self, listing_id):
    listing_id = long(listing_id)
    with LISTINGS_LOCK:
      if listing_id >= len(LISTINGS):
        self.response.code = 404
        return
      listing = self.request.post_data
      listing['id'] = listing_id
      LISTINGS[listing_id] = listing
    self.response.headers['content-type'] = 'application/json'
    self.response.write(json.dumps({'id': listing['id']}))


class Listings(myserver.Handler):
  def get(self):
    length = long(self.request.params.get('length', 0)) or len(LISTINGS)
    page = long(self.request.params.get('page', 0))
    start = page * length

    listings = GetNondeleted(LISTINGS)

    if self.request.params.get('active') == '1':
      listings = GetActive(listings)

    radius = float(self.request.params.get('radius', 0))
    if radius:
      x = float(self.request.params.get('x', 0))
      y = float(self.request.params.get('y', 0))
      listings = FilterByDistanceFrom(listings, x, y, radius)

    self.response.headers['content-type'] = 'application/json'
    self.response.write(json.dumps(list(listings)[start:start + length], sort_keys=True))

  def post(self):
    listing = self.request.post_data
    with LISTINGS_LOCK:
      listing['id'] = len(LISTINGS)
      LISTINGS.append(listing)
    self.response.headers['content-type'] = 'application/json'
    self.response.write(json.dumps({'id': listing['id']}))


if __name__ == '__main__':
  server = myserver.HTTPServer((
          ('/api/listings/([0-9]+)/comments/?$', Comments),
          ('/api/listings/([0-9]+)$', Listing),
          ('/api/listings/?$', Listings),
      ), port=9090)
  print 'Now serving on port 9090.'
  server.serve_forever()
