# Copyright 2015 Daniel Reed <n@ml.org>

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app


class Redirect(webapp.RequestHandler):
  def get(self):
    self.redirect('https://nmlorg.github.io/naim/')


app = webapp.WSGIApplication([
    ('/.*', Redirect),
], debug=True)


def main():
  run_wsgi_app(app)


if __name__ == '__main__':
  main()
