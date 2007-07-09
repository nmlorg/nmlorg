#!/usr/bin/python2.5

import os
import sys
from gflags import gflags

gflags.DEFINE_string('editor', None, 'Text editor to invoke when editing specs', short_name='E')

import client
cmd_client = client.cmd_client

def main(argv):
  if not gflags.FLAGS.editor:
    if os.getenv('EDITOR'):
      gflags.FLAGS.editor = os.getenv('EDITOR')
    elif os.getenv('VISUAL'):
      gflags.FLAGS.editor = os.getenv('VISUAL')
    else:
      gflags.FLAGS.editor = 'vi'

  if len(argv) == 1:
    print gflags.FLAGS
    return 0

  if argv[1] == 'help':
    if len(argv) == 2:
      for f in globals():
        if f.startswith('cmd_'):
          print '    ' + f[4:] + (globals()[f].__doc__ and ' (' + globals()[f].__doc__.split('\n')[0] + ')' or '')
      return 0
    elif 'cmd_' + argv[2] in globals():
      return globals()['cmd_' + argv[2]](argv[2:] + [ '--help' ])
    else:
      print 'No help for ' + argv[2]
      return 1

  if 'cmd_' + argv[1] in globals():
    return globals()['cmd_' + argv[1]](argv[1:])

  print argv[0] + ': unknown action: ' + argv[1] + ': try svn instead?'
  print gflags.FLAGS

if __name__ == '__main__':
  argv = gflags.FLAGS(sys.argv)

  sys.exit(main(argv))
