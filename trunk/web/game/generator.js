/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg.require('nmlorg.game.platforms');
nmlorg.require('nmlorg.math.prng');


/** @namespace */
nmlorg.game.generator = nmlorg.game.generator || {};


nmlorg.game.generator.Generator = function(pset, seed) {
  this.pset = pset;
  this.prng = new nmlorg.math.prng.PRNG(seed);
};


var sides_ = [
    'getLeft',
    'getRear',
    'getRight',
    'getFront',
];


nmlorg.game.generator.Generator.prototype.add = function() {
  var parent;

  while (true) {
    parent = this.pset[this.prng.between(0, this.pset.length - 1)];
    if (!parent.got0 || !parent.got1 || !parent.got2 || !parent.got3)
      break;
  }

  var width, length;

  if (parent.right > parent.rear) {
    width = 2;
    length = this.prng.between(5, 15);
  } else {
    width = this.prng.between(5, 15);
    length = 2;
  }

  var platform = this.pset.add(width, length);
  var side;

  while (true) {
    side = this.prng.between(0, 3);
    if (!parent['got' + side])
      break;
  }

  parent['got' + side] = true;
  platform['got' + ((side + 2) % 4)] = true;
  nmlorg.game.platforms.connect(parent[sides_[side]](0, 0, 0),
                                platform[sides_[(side + 2) % 4]](0, 0, 0));
};


})();
