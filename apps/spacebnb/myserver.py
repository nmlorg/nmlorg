#!/usr/bin/python

import BaseHTTPServer
import cgi
import cStringIO as StringIO
import json
import re


class Handler(object):
  def __init__(self, request, response):
    self.request = request
    self.response = response


class HTTPServer(BaseHTTPServer.HTTPServer, object):
  def __init__(self, handlers, port=8080):
    self.handlers = handlers
    super(HTTPServer, self).__init__(('', port), HTTPRequestHandler)


class HTTPRequestHandler(BaseHTTPServer.BaseHTTPRequestHandler):
  params = {}
  query_string = ''

  def do_GET(self):
    self.raw_path = self.path
    if '?' in self.path:
      self.path, self.query_string = self.path.split('?', 1)
    if self.query_string:
      self.params = dict(cgi.parse_qsl(self.query_string))

    for pattern, handler_class in self.server.handlers:
      match = re.match(pattern, self.path)
      if match:
        if not hasattr(handler_class, self.command.lower()):
          self.send_response(501)  # Not Implemented
          self.end_headers()
        else:
          if self.command in ('POST', 'PUT'):
            content_length = int(self.headers.get('content-length', 0))
            self.post_data = self.rfile.read(content_length)
            content_type = self.headers.get('content-type', '').split(';', 1)[0]
            if content_type == 'application/x-www-form-urlencoded':
              self.post_data = dict(cgi.parse_qsl(self.post_data))
            elif content_type == 'application/json':
              self.post_data = json.loads(self.post_data)
          response = Response()
          handler_instance = handler_class(self, response)
          handler_method = getattr(handler_instance, self.command.lower())
          try:
            handler_method(*match.groups())
          except:
            response.code = 500
          self.send_response(response.code)
          for header, content in response.headers.iteritems():
            self.send_header(header, content)
          self.end_headers()
          self.wfile.write(response.buffer.getvalue())
          response.buffer.close()
        return

    self.send_response(404)
    self.end_headers()

  do_DELETE = do_POST = do_PUT = do_GET


class Response(object):
  code = 200

  def __init__(self):
    self.headers = {}
    self.buffer = StringIO.StringIO()
    self.write = self.buffer.write
