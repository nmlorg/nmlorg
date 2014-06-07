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


nmlorg.game.generator.Generator.prototype.getParent_ = function() {
  while (true) {
    var parent = this.prng.choose(this.pset);

    if (!parent.got0 || !parent.got1 || !parent.got2 || !parent.got3)
      return parent;
  }
};


var sides_ = [
    'getLeft',
    'getRear',
    'getRight',
    'getFront',
];


nmlorg.game.generator.Generator.prototype.add = function() {
  var height = this.prng.choose([0, .4]);
  var parent, side, width, length;

  while (true) {
    parent = this.getParent_();

    if (parent.right > parent.rear) {
      width = this.prng.between(1, 3);
      length = this.prng.between(5, 25);
    } else {
      width = this.prng.between(5, 25);
      length = this.prng.between(1, 3);
    }

    while (parent['got' + (side = this.prng.between(0, 3))])
      ;

    var points;

    if (side == 0)
      points = [
          parent.getLeft(0, length / 2, height),
          parent.getLeft(0, -length / 2, height),
          parent.getLeft(-width, length / 2, height),
          parent.getLeft(-width, -length / 2, height),
      ];
    else if (side == 1)
      points = [
          parent.getRear(width / 2, 0, height),
          parent.getRear(-width / 2, 0, height),
          parent.getRear(width / 2, length, height),
          parent.getRear(-width / 2, length, height),
      ];
    else if (side == 2)
      points = [
          parent.getRight(0, length / 2, height),
          parent.getRight(0, - length / 2, height),
          parent.getRight(width, length / 2, height),
          parent.getRight(width, - length / 2, height),
      ];
    else if (side == 3)
      points = [
          parent.getFront(width / 2, 0, height),
          parent.getFront(-width / 2, 0, height),
          parent.getFront(width / 2, -length, height),
          parent.getFront(-width / 2, -length, height),
      ];

    for (var i = 0; i < this.pset.length; i++) {
      var platform = this.pset[i];

      if (platform === parent)
        continue;

      for (var j = 0; j < points.length; j++)
        if (platform.localize(points[j]).inside())
          break;

      if (j < points.length)
        break;
    }

    if (i == this.pset.length)
      break;
  }

  var platform = this.pset.add(width, length);

  parent['got' + side] = true;
  platform['got' + ((side + 2) % 4)] = true;
  nmlorg.game.platforms.connect(parent[sides_[side]](0, 0, height),
                                platform[sides_[(side + 2) % 4]](0, 0, 0));
};


})();
