#!/usr/bin/python2.5
#
# Copyright 2010 Daniel Reed <n@ml.org>

import os
import sys
sys.path.append(os.path.expanduser('~/google_appengine'))
sys.path.append(os.path.expanduser('~/google_appengine/lib/django'))
sys.path.append(os.path.expanduser('~/google_appengine/lib/webob'))
from google.appengine.ext.webapp import template


def main(argv):
  print template.render(argv[1], {})


if __name__ == '__main__':
  sys.exit(main(sys.argv))
