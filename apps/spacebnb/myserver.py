#!/usr/bin/python

import cgi
import cStringIO as StringIO
from gevent import monkey
from gevent import pywsgi
import json
import logging
import re
import wsgiref.headers

monkey.patch_all()


class Handler(object):
  def __init__(self, request, response):
    self.request = request
    self.response = response


class HTTPServer(pywsgi.WSGIServer):
  def __init__(self, handlers, port=8080):
    self.handlers = handlers
    super(HTTPServer, self).__init__(('', port), self)

  def __call__(self, env, start_response):
    request = Request(env)
    response = Response()

    for pattern, handler_class in self.handlers:
      match = re.match(pattern, request.path)
      if match:
        if not hasattr(handler_class, request.command.lower()):
          start_response('501 Not Implemented', [])
        else:
          handler_instance = handler_class(request, response)
          handler_method = getattr(handler_instance, request.command.lower())
          try:
            handler_method(*match.groups())
          except:
            logging.exception('Exception while running handler:')
            response.code = 500
          write = start_response('%i -' % response.code, response.headers.items())
          write(response.buffer.getvalue())
          response.buffer.close()
        break
    else:
      start_response('404 Not Found', [])
    return []


class Request(object):
  content_length = 0
  content_type = ''
  post_data = None

  def __init__(self, env):
    self.command = env['REQUEST_METHOD']
    self.params = dict(cgi.parse_qsl(env['QUERY_STRING']))
    self.path = env['PATH_INFO']

    if self.command in ('POST', 'PUT'):
      self.content_length = int(env.get('CONTENT_LENGTH', 0))
      self.post_data = env['wsgi.input'].read(self.content_length)
      self.content_type = env.get('CONTENT_TYPE', '').split(';', 1)[0]
      if self.content_type == 'application/x-www-form-urlencoded':
        self.post_data = dict(cgi.parse_qsl(self.post_data))
      elif self.content_type == 'application/json':
        self.post_data = json.loads(self.post_data)


class Response(object):
  code = 200

  def __init__(self):
    self.headers = wsgiref.headers.Headers([])
    self.buffer = StringIO.StringIO()
    self.write = self.buffer.write
