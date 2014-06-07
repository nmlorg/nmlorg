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
  var height = this.prng.choose([-.4, 0, .4]);
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

    var lx, ly;

    if (side == 0) {
      lx = -width;
      ly = -length / 2;
    } else if (side == 1) {
      lx = -width / 2;
      ly = 0;
    } else if (side == 2) {
      lx = 0;
      ly = -length / 2;
    } else if (side == 3) {
      lx = -width / 2;
      ly = -length;
    }

    var overlap = false;

    for (var i = 0; !overlap && (i < this.pset.length); i++) {
      var platform = this.pset[i];

      if (platform === parent)
        continue;

      for (var x = 0; !overlap && (x <= width); x += 2)
        for (var y = 0; !overlap && (y <= length); y += 2)
          if (platform.localize(parent[sides_[side]](lx + x, ly + y, height)).inside())
            overlap = true;
    }

    if (!overlap)
      break;
  }

  var platform = this.pset.add(width, length);

  parent['got' + side] = true;
  platform['got' + ((side + 2) % 4)] = true;
  nmlorg.game.platforms.connect(parent[sides_[side]](0, 0, height),
                                platform[sides_[(side + 2) % 4]](0, 0, 0));
};


})();
