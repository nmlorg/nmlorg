/**
 * @fileoverview http://www.opengamingfoundation.org/srd/srdbasics.rtf
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg.require('nmlorg.math.prng');

/** @namespace */
nmlorg.rpg.basics = nmlorg.rpg.basics || {};


nmlorg.rpg.basics.Dice = function(seed) {
  this.prng = new nmlorg.math.prng.PRNG(seed || 1);
};


nmlorg.rpg.basics.Dice.prototype.roll = function(s) {
  var pieces = s.split(/([^0-9]+)/);
  var rolls = parseInt(pieces[0] || 1);
  var dieType = parseInt(pieces[2]);
  var sum = 0;

  for (var i = 0; i < rolls; i++)
    sum += this.prng.between(1, dieType);

  if (pieces.length > 4)
    sum += (pieces[3] == '-' ? -1 : 1) * parseInt(pieces[4]);

  return sum;
};


nmlorg.rpg.basics.Dice.prototype.resolve = function(modifier, target) {
  return this.roll('d20') + modifier >= target;
};

})();
