#!/usr/bin/python2.5

import ao
import ogg.vorbis
import sys

import spectralyzer


class Sample(object):
  def __init__(self, buf, bits, rate, channels):
    self.buf = buf
    self.bytes = bits/8
    self.rate = rate
    self.channels = channels
    self.stride = self.bytes * channels
    self.len = len(buf) / self.stride

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

  def __len__(self):
    return self.len


class PCMAccessor(object):
  def __init__(self, bits=16, rate=44100, channels=2):
    self.bits = bits
    self.rate = rate
    self.channels = channels

  def Sample(self, buf):
    return Sample(buf, self.bits, self.rate, self.channels)


def main(argv):
  devs = {}
  files = {}

  for filename in argv[1:]:
    print 'Playing', filename

    if filename not in files:
      f = ogg.vorbis.VorbisFile(filename)
      files[filename] = (f, f.info())
    f, finfo = files[filename]
    bits = 16

    if (bits, finfo.rate, finfo.channels) not in devs:
      devs[bits, finfo.rate, finfo.channels] = ao.AudioDevice('alsa09', bits=bits, rate=finfo.rate, channels=finfo.channels)
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

      buf = buffer(buf, 0, buflen)
      dev.play(buf)
      sample = accessor.Sample(buf)
      spectrum = spectralyzer.Spectrum(sample, 128)
      print ('%5i  %8i  %10.4f  %8i  %8i  %8i  %8i  %8i  %8i\r' % (
             buflen,
             f.bitrate_instant(),
             f.time_tell(),
             f.pcm_tell(),
             f.raw_tell(),
             max(spectrum[0]), max(spectrum[1]), sum(spectrum[0]), sum(spectrum[1]))),

if __name__ == '__main__':
  sys.exit(main(sys.argv))
