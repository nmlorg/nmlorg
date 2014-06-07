/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {


/** @namespace */
nmlorg.math.prng = nmlorg.math.prng || {};


nmlorg.math.prng.PRNG = function(seed) {
  if (!seed)
    seed = +new Date();
  this.x = seed;
  this.y = seed * 2;
  this.z = seed * 3;
  this.w = seed * 4;
};


nmlorg.math.prng.PRNG.prototype.maxNext_ = Math.pow(2, 32) - 1;


// http://en.wikipedia.org/wiki/Xorshift#Example_implementation
nmlorg.math.prng.PRNG.prototype.next = function() {
  var t;

  t = this.x ^ (this.x << 11);
  this.x = this.y; this.y = this.z; this.z = this.w;
  return this.w = this.w ^ (this.w >> 19) ^ t ^ (t >> 8);
};


nmlorg.math.prng.PRNG.prototype.random = function() {
  return this.next() / this.maxNext_;
};


nmlorg.math.prng.PRNG.prototype.between = function(min, max) {
  return min + this.next() % (max - min + 1);
};


nmlorg.math.prng.PRNG.prototype.choose = function(list) {
  return list[this.between(0, list.length - 1)];
};


})();
