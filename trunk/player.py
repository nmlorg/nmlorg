#!/usr/bin/python2.5

import ao
import ogg.vorbis
import sys


class Sample(object):
  def __init__(self, buf, bits, rate, channels):
    self.buf = buf
    self.bytes = bits/8
    self.rate = rate
    self.channels = channels
    self.stride = self.bytes * channels

  def toint(self, s):
    assert len(s) in [1, 2]

    if len(s) == 1:
      s = ord(s)
      if s > 0x7F:
        s = -1 - (0xFF - s)
      return s
    else:
      s = ord(s[0]) + 256*ord(s[1])
      if s > 0x7FFF:
        s = -1 - (0xFFFF - s)
      return s

  def __getitem__(self, i):
    if not isinstance(i, int):
      raise IndexError

    off = i * self.stride

    if off >= len(self.buf):
      raise IndexError

    buf = buffer(self.buf, off, self.stride)

    if self.channels == 1:
      ret = self.toint(buf[:])
      return ret, ret
    else:
      return self.toint(buf[:self.bytes]), self.toint(buf[self.bytes:])


class PCMAccessor(object):
  def __init__(self, bits=16, rate=44100, channels=2):
    self.bits = bits
    self.rate = rate
    self.channels = channels

  def Sample(self, buf):
    return Sample(buf, self.bits, self.rate, self.channels)


def main(argv):
  devs = {}

  for filename in argv[1:]:
    f = ogg.vorbis.VorbisFile(filename)
    finfo = f.info()
    bits = 16

    if (bits, finfo.rate, finfo.channels) not in devs:
      print 'Opening alsa09 with bits=%i, rate=%i, channels=%i' % (bits, finfo.rate, finfo.channels)
      devs[bits, finfo.rate, finfo.channels] = ao.AudioDevice('alsa09', bits=bits, rate=finfo.rate, channels=finfo.channels)
    else:
      print 'Reusing bits=%i, rate=%i, channels=%i device driver from a previous run' % (bits, finfo.rate, finfo.channels)

    dev = devs[bits, finfo.rate, finfo.channels]

    accessor = PCMAccessor(bits=bits, rate=finfo.rate, channels=finfo.channels)

    while True:
      try:
        buf, buflen, bitstreamval = f.read()
      except ogg.vorbis.VorbisError:
        print 'Caught VorbisError'
        break

      if not buflen:
        print 'Got a buffer with buflen=0'
        break

      print '%i\t%i\t%i\t%i\t%f\t%f\t%i\t%i\t%i\t%i' % (
          buflen, bitstreamval,
          f.bitrate_instant(), f.bitrate(),
          f.time_tell(), f.time_total(),
          f.pcm_tell(), f.pcm_total(),
          f.raw_tell(), f.raw_total())

      buf = buffer(buf, 0, buflen)
      sample = accessor.Sample(buf)
      dev.play(buf)

if __name__ == '__main__':
  sys.exit(main(sys.argv))
