#!/usr/bin/python2.4

import numpy


def Spectrum(a):
  ret = []

  a = numpy.array(a)
  for i in xrange(len(a[0])):
    f = numpy.fft.fft(a[:,i])
    ret.append(list(abs(f)))

  return ret
