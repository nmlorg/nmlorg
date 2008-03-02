#!/usr/bin/python2.4

import math
import numpy


tmps = {}

def Spectrum(a, N=None):
  if not N:
    N = len(a)
  else:
    N = min(N, len(a))
  channels = len(a[0])

  if N not in tmps:
    tmps[N] = [0.0]*N
  tmp = tmps[N]

  ret = []

  for channel in xrange(channels):
    for bucket in xrange(N):
      tmp[bucket] = a[bucket][channel]
    f = numpy.fft.rfft(tmp)
    ret.append([math.sqrt(f[bucket+1].real**2 + f[bucket+1].imag**2) for bucket in xrange(N/2)])

  return ret
