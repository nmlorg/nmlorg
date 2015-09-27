#!/usr/bin/python

import prime


class Fraction(object):
  def __init__(self, num, denom):
    if isinstance(num, Fraction):
      top = num.num
      bottom = num.denom
    else:
      top = num
      bottom = 1
    if isinstance(denom, Fraction):
      top *= denom.denom
      bottom *= denom.num
    else:
      bottom *= denom
    self.num = top
    self.denom = bottom

  def Simplify(self):
    if self.num == 1 or self.denom == 1:
      return self
    if self.num % self.denom == 0:
      return type(self)(self.num / self.denom, 1)
    elif self.denom % self.num == 0:
      return type(self)(1, self.denom / self.num)
    num = self.num
    denom = self.denom
    for factor in prime.PrimesBelow(min(num, denom)):
      if num % factor == 0 and denom % factor == 0:
        num /= factor
        denom /= factor
        if num < factor or denom < factor:
          break
    return type(self)(num, denom)

  def __add__(self, rhs):
    if not isinstance(rhs, Fraction):
      rhs = Fraction(rhs, 1)
    return type(self)(self.num * rhs.denom + rhs.num * self.denom, self.denom * rhs.denom)

  def __radd__(self, lhs):
    return self + lhs

  def __repr__(self):
    return 'Fraction(%r, %r)' % (self.num, self.denom)

  def __str__(self):
    if self.denom == 1:
      return str(self.num)

    simplified = self.Simplify()
    if simplified.denom == 1:
      return '%s / %r [%r]' % (self.num, self.denom, simplified.num)

    s = str(float(simplified.num) / simplified.denom)
    whole, frac = s.split('.', 1)
    if len(frac) > 6:
      s = '~%s.%s' % (whole, frac[:5])
    if simplified.num == self.num:
      return '%r / %r [%s]' % (self.num, self.denom, s)
    return '%s / %r [%r / %r, %s]' % (self.num, self.denom, simplified.num, simplified.denom, s)


if __name__ == '__main__':
  import time

  print 'Approximating the square root of 2:'
  frac = 1
  while True:
    frac = 1 + Fraction(1, 1 + frac)
    print '%s / %s = %s' % (frac.num, frac.denom, float(frac.num) / frac.denom)
    time.sleep(1)
