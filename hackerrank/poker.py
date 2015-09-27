import collections


class Card(collections.namedtuple('Card', ('value', 'face', 'suit'))):
  def __repr__(self):
    return '%s%s' % (self.face, self.suit)

  def __gt__(self, rhs):
    return self.value > rhs.value

  def __lt__(self, rhs):
    return self.value < rhs.value

  def __eq__(self, rhs):
    return self.value == rhs.value


def Choose(group, num, ignore=(), start=0):
  for i in xrange(start, len(group) - num + 1):
    if group[i] not in ignore:
      if num == 1:
        yield (group[i],)
      else:
        for rest in Choose(group, num - 1, ignore, i + 1):
          yield (group[i],) + rest


def ScoreHand(cards):
  assert len(cards) == 5

  straight = True
  for i in xrange(1, 5):
    if cards[4 - i].value != cards[4].value + i:
      straight = False
      break

  flush = True
  for i in xrange(1, 5):
    if cards[i].suit != cards[0].suit:
      flush = False
      break

  # Straight flush (including royal flush).
  if straight and flush:
    return 9, cards

  # Four of a kind, ranked by the face of the four of a kind then face of the remaining card.
  if cards[0].face == cards[1].face == cards[2].face == cards[3].face:
    return 8, cards
  if cards[1].face == cards[2].face == cards[3].face == cards[4].face:
    return 8, cards[1:] + cards[:1]

  # Full house, ranked by the face of the three of a kind then the face of the pair.
  if cards[0].face == cards[1].face == cards[2].face and cards[3].face == cards[4].face:
    return 7, cards
  if cards[0].face == cards[1].face and cards[2].face == cards[3].face == cards[4].face:
    return 7, cards[2:] + cards[:2]

  # Non-straight flush.
  if flush:
    return 6, cards

  # Non-flush straight.
  if straight:
    return 5, cards

  # Three of a kind, ranked by the face of the three of a kind then the faces of the non-pair.
  if cards[0].face == cards[1].face == cards[2].face:
    return 4, cards
  if cards[1].face == cards[2].face == cards[3].face:
    return 4, cards[1:4] + cards[:1] + cards[4:]
  if cards[2].face == cards[3].face == cards[4].face:
    return 4, cards[2:] + cards[:2]

  # Two pair, ranked by highest-ranking pair then lowest-ranking pair then remaining card.
  if cards[0].face == cards[1].face and cards[2].face == cards[3].face:
    return 3, cards
  if cards[0].face == cards[1].face and cards[3].face == cards[4].face:
    return 3, cards[:2] + cards[3:] + cards[2:3]
  if cards[1].face == cards[2].face and cards[3].face == cards[4].face:
    return 3, cards[1:] + cards[:1]

  # One pair, ranked by pair followed by remaining cards in order.
  if cards[0].face == cards[1].face:
    return 2, cards
  if cards[1].face == cards[2].face:
    return 2, cards[1:3] + cards[:1] + cards[3:]
  if cards[2].face == cards[3].face:
    return 2, cards[2:4] + cards[:2] + cards[4:]
  if cards[3].face == cards[4].face:
    return 2, cards[3:] + cards[:3]

  return 1, cards


VALUES = {
    '2': (2,),
    '3': (3,),
    '4': (4,),
    '5': (5,),
    '6': (6,),
    '7': (7,),
    '8': (8,),
    '9': (9,),
    'T': (10,),
    'J': (11,),
    'Q': (12,),
    'K': (13,),
    'A': (14, 1),
}


def GetHands(card_strings):
  cards = [(s[0].upper(), s[1].upper()) for s in card_strings]

  for (f1, s1), (f2, s2), (f3, s3), (f4, s4), (f5, s5) in Choose(cards, 5):
    for v1 in VALUES[f1]:
      c1 = Card(v1, f1, s1)
      for v2 in VALUES[f2]:
        c2 = Card(v2, f2, s2)
        for v3 in VALUES[f3]:
          c3 = Card(v3, f3, s3)
          for v4 in VALUES[f4]:
            c4 = Card(v4, f4, s4)
            for v5 in VALUES[f5]:
              c5 = Card(v5, f5, s5)
              yield ScoreHand(sorted((c1, c2, c3, c4, c5), reverse=True))
