#!/usr/bin/python2.5

import os
import re
from string import Template
from gflags import gflags

def findroot(d=None):
  if not d:
    d = os.getcwd()
  else:
    d = os.path.realpath(d)

  while d != '/':
    p = os.path.join(d, '.nvn')
    if os.path.isdir(p):
      return d
    d = os.path.dirname(d)

  return None

def parsebash(p):
  file = open(p)
  s = file.read()
  file.close()

  lines = [ x.strip() for x in s.split('\n') if x.strip() != '' and x.strip()[0] != '#' ]
  spec = {}

  for line in lines:
    m = re.match(r'^(\w*)="?(.*[^"])"?$', line)
    if m:
      k, v = m.groups()
      spec[k] = Template(v).safe_substitute(spec)

  return spec

class Client(object):
  """ Client specification.

    Root: The base directory of the client workspace.
    Name: The client name.
  """
  @property
  def Root(self):
    '''The base directory of the client workspace'''

    if not hasattr(self, '__root'):
      self.__root = findroot()

    if not self.__root:
      raise Exception('Unable to find client root')

    return self.__root

  def __getspec(self, k):
    if not hasattr(self, '__clientspec'):
      p = os.path.join(self.Root, '.nvn', 'clientspec')
      self.__clientspec = os.path.isfile(p) and parsebash(p) or {}

    return k in self.__clientspec and self.__clientspec[k] or ''

  def __setspec(self, k, v):
    print 'hi'
    self.__getspec(k)
    self.__clientspec[k] = v
    p = os.path.join(self.Root, '.nvn', 'clientspec')
    print p
    file = open(p, 'w')
    print '\n'.join([ '#!/bin/sh', '' ] + [ k + '="' + v + '"' for (k, v) in self.__clientspec.iteritems() ])
    file.write('\n'.join([ '#!/bin/sh', '' ] + [ k + '="' + v + '"' for (k, v) in self.__clientspec.iteritems() ]))
    file.close()

  def __getname(self):
    return self.__getspec('CLIENT')

  def __setname(self, val):
    self.__setspec('CLIENT', val)

  Name = property(__getname, __setname)

  def __str__(self):
    s = [ '# ' + x for x in self.__doc__.split('\n')[:-1] ]

    s.append('#')

    for attr in dir(self):
      if attr[0].isupper():
        s.append('')
        s.append(attr + ': ' + getattr(self, attr) or '')

    return '\n'.join(s)

  def fromspec(s):
    pass

def cmd_client(argv):
  argv = gflags.FLAGS(argv)

  client = Client()

  while True:
    p = os.tmpnam()
    try:
      os.mkdir(p)
    except:
      continue
    break

  f = os.path.join(p, 'spec')

  file = open(f, 'w')
  file.write(str(client))
  file.close()

  os.system(gflags.FLAGS.editor + ' ' + f)

  file = open(f)
  client.fromspec(file.read())
  file.close()

  print 'remove', f
  os.remove(f)
  print 'rmdir', p
  os.rmdir(p)

  return 0
