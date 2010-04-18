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
  values = {
      'section': argv[1][len('templates/'):].rsplit('.', 1)[0],
      'sections': [
          ('About', 'about'),
          ('Downloads', 'download'),
          ('OS Packages', 'packages'),
          ('Quickstart', 'quickstart'),
          ('NaimWiki', 'http://code.google.com/p/naim/w/list'),
          ('Issue Tracker', 'http://code.google.com/p/naim/issues/list'),
          ('Screenshots', 'screenshots'),
          ('Mailing Lists', 'lists'),
          ('Additional Docs', 'docs/'),
      ],
  }

  print template.render(argv[1], values)


if __name__ == '__main__':
  sys.exit(main(sys.argv))
