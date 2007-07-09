#!/usr/bin/python2.5

import os
import re
import cPickle
from gflags import gflags
from svn import svn

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

def guessname():
  cwd = os.getcwd()
  home = os.getenv('HOME')

  if cwd == home:
    return os.uname()[1]
  return os.getlogin() + '-' + os.path.basename(cwd)

def parsespec(s):
  lines = [ x for x in s.split('\n') if x.strip() != '' and x.strip()[0] != '#' ]
  spec = {}

  k = None
  for line in lines:
    m = re.match(r'^(\w*):\s*(.*)$', line.rstrip())
    if m:
      k, v = m.groups()
      spec[k] = []
      if v != '':
        spec[k].append(v)
      continue

    m = re.match(r'^\s+(.*)$', line.rstrip())
    if m:
      spec[k].append(m.groups()[0])
      continue

    print 'Unknown line:', line

  return spec


class Client(object):
  """ Client specification.

    Root: The base directory of the client workspace.
    Name: The client name.
    Repository: The URL to the root of the Subversion repository.
  """
  @property
  def Root(self):
    '''The base directory of the client workspace'''

    if not hasattr(self, '__root'):
      self.__root = findroot()

    if not self.__root:
      raise Exception('Unable to find client root')

    return self.__root


  @property
  def fullroot(self):
    return self.Repository + '/clients/' + self.Name


  def __getspec(self, k):
    if not hasattr(self, '__clientspec'):
      p = os.path.join(self.Root, '.nvn', 'clientspec.pickle')
      if os.path.isfile(p):
        file = open(p)
        self.__clientspec = cPickle.load(file)
        file.close()
      else:
        self.__clientspec = {}

    return k in self.__clientspec and self.__clientspec[k] or ''

  def __setspec(self, k=None, v=None):
    if k and v:
      self.__getspec(k)
      self.__clientspec[k] = v

    p = os.path.join(self.Root, '.nvn', 'clientspec.pickle')
    file = open(p, 'w')
    cPickle.dump(self.__clientspec, file)
    file.close()


  def __getname(self):
    name = self.__getspec('Name')

    if not name:
      name = self.__clientspec['Name'] = guessname()

    return name

  def __setname(self, val):
    if not re.match(r'^[a-zA-Z0-9-_]*$', val):
      raise Exception('Client name must match ^[a-zA-Z0-9-_]*$')

    oldname = self.Name
    oldroot = self.fullroot

    self.__setspec('Name', val)

    if self.Repository:
      svn('move', '-m', 'Renaming client from ' + oldname + ' to ' + val, oldroot, self.fullroot)

  Name = property(__getname, __setname)


  def __getrepo(self):
    return self.__getspec('Repository')

  def __setrepo(self, val):
    if val == self.Repository:
      return

    if not re.match(r'^https?://', val):
      raise Exception('Repository URL must match ^https?://')

    oldrepo = self.Repository
    oldroot = self.fullroot

    self.__setspec('Repository', val)

    if oldrepo:
      svn('remove', '-m', 'Moving client ' + self.Name + ' to ' + self.rullroot, oldroot)

    svn('mkdir', '-m', 'Creating client ' + self.Name, self.fullroot)

  Repository = property(__getrepo, __setrepo)


  def __getprop(self, k):
    return svn('propget', k, self.fullroot);

  def __setprop(self, k, v):
    p = os.path.join(self.Root, '.nvn/rootstub')

    svn('propset', k, v, p)
    svn('commit', '-m', 'Set prop ' + k, p)


  def __getdesc(self):
    return self.__getprop('Description')

  def __setdesc(self, val):
    self.__setprop('Description', val)

  Description = property(__getdesc, __setdesc)


  #def __getmapping(self):
  #  return self.__getspec('Mapping')

  #def __setmapping(self, val):
  #  self.__setspec('Mapping', val)

  #Mapping = property(__getmapping, __setmapping)


  def __str__(self):
    s = [ '# ' + x for x in self.__doc__.split('\n')[:-1] ]

    s.append('#')

    for attr in dir(self):
      if attr[0].isupper():
        s.append('')
        val = getattr(self, attr).split('\n')
        if len(val) == 1:
          s.append(attr + ':\t' + val[0])
        else:
          s.append(attr + ':')
          s += [ '\t' + x for x in val ]

    return '\n'.join(s)

  def fromspec(self, s):
    spec = parsespec(s)

    for k, v in spec.iteritems():
      spec[k] = '\n'.join(v)

    if not all(map(lambda x: x in spec, [ x for x in dir(self) if x[0].isupper() ])):
      return False

    for k, v in spec.iteritems():
      if not hasattr(self, k) or getattr(self, k) != v:
        try:
          setattr(self, k, v)
        except Exception, e:
          return False, e

    return True


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
  s = file.read()
  file.close()

  os.remove(f)
  os.rmdir(p)

  ret = client.fromspec(s)

  if ret == True:
    print 'Client ' + client.Name + ' updated.'
  else:
    print 'Error updating client:', ret

  return 0
