#!/usr/bin/python


class Spiral(list):
  def __init__(self, diam, clockwise=True, first='right'):
    assert diam % 2 == 1
    super(Spiral, self).__init__([0] * diam for _ in xrange(diam))
    center = diam / 2
    counter = Counter()

    if clockwise:
      def Right(minxy, maxxy):
        for posy in xrange(minxy + 1, maxxy + 1):
          self[posy, maxxy] = counter.Next()
      def Bottom(minxy, maxxy):
        for posx in xrange(maxxy - 1, minxy - 1, -1):
          self[maxxy, posx] = counter.Next()
      def Left(minxy, maxxy):
        for posy in xrange(maxxy - 1, minxy - 1, -1):
          self[posy, minxy] = counter.Next()
      def Top(minxy, maxxy):
        for posx in xrange(minxy + 1, maxxy + 1):
          self[minxy, posx] = counter.Next()
      steps = {
          'R': (Right, Bottom, Left, Top),
          'B': (Bottom, Left, Top, Right),
          'L': (Left, Top, Right, Bottom),
          'T': (Top, Right, Bottom, Left),
      }[first[0].upper()]
    else:
      def Right(minxy, maxxy):
        for posy in xrange(maxxy - 1, minxy - 1, -1):
          self[posy, maxxy] = counter.Next()
      def Top(minxy, maxxy):
        for posx in xrange(maxxy - 1, minxy - 1, -1):
          self[minxy, posx] = counter.Next()
      def Left(minxy, maxxy):
        for posy in xrange(minxy + 1, maxxy + 1):
          self[posy, minxy] = counter.Next()
      def Bottom(minxy, maxxy):
        for posx in xrange(minxy + 1, maxxy + 1):
          self[maxxy, posx] = counter.Next()
      steps = {
          'R': (Right, Top, Left, Bottom),
          'T': (Top, Left, Bottom, Right),
          'L': (Left, Bottom, Right, Top),
          'B': (Bottom, Right, Top, Left),
      }[first[0].upper()]

    self[center, center] = counter.Next()
    for radius in xrange(1, diam / 2 + 1):
      for step in steps:
        step(center - radius, center + radius)
    self.maxnumlen = len(str(counter.num))

  def __getitem__(self, k):
    if isinstance(k, (list, tuple)) and len(k) == 2:
      return self[k[0]][k[1]]
    return super(Spiral, self).__getitem__(k)

  def __setitem__(self, k, v):
    if isinstance(k, (list, tuple)) and len(k) == 2:
      self[k[0]][k[1]] = v
    else:
      super(Spiral, self).__setitem__(k, v)

  def __str__(self):
    return '\n'.join(' '.join('%*s' % (self.maxnumlen, num) for num in line) for line in self)


class Counter(object):
  num = 0

  def Next(self):
    self.num += 1
    return self.num


if __name__ == '__main__':
  import time

  i = 1
  while True:
    print Spiral(i)
    i += 2
    time.sleep(1)
