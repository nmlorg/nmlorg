#!/usr/bin/python2.5

import os

def svn(*args):
  newargs = []
  lastarg = ''
  for arg in args:
    if lastarg == '-m':
      arg = 'nvn: ' + arg
    newargs.append(arg)
    lastarg = arg

  #return os.spawnvp(os.P_WAIT, 'svn', [ 'svn' ] + newargs)
  w, r = os.popen2([ 'svn' ] + newargs)

  return r.read()
