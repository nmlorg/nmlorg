#!/usr/bin/python


def PrimeAfter(n):
  while True:
    n += 1
    if CheckIsPrime(n):
      return n


BIGGEST_PRIME = 2
PRIMES = {BIGGEST_PRIME}


def CheckIsPrime(n):
  for x in PRIMES:
    if (n % x) == 0:
      return False
  return True


def IsPrime(n):
  global BIGGEST_PRIME

  while BIGGEST_PRIME < n:
    BIGGEST_PRIME = PrimeAfter(BIGGEST_PRIME)
    PRIMES.add(BIGGEST_PRIME)
  return BIGGEST_PRIME == n or n in PRIMES


def PrimesBelow(n):
  for i in xrange(2, n):
    if IsPrime(i):
      yield i


if __name__ == '__main__':
  import time

  while True:
    print BIGGEST_PRIME
    IsPrime(PrimeAfter(BIGGEST_PRIME))
    time.sleep(1)
