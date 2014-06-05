/**
 * @fileoverview Low-quality numeric routines.
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
nmlorg.math.numbers = nmlorg.math.numbers || {};


var LOG10 = Math.log(10);


function log10(a) {
  return Math.log(a) / LOG10;
}


/**
 * Return whether |a - b| < epsilon (in this case, .0001).
 * @param {number} a
 * @param {number} b
 * @return {boolean}
 */
nmlorg.math.numbers.equal = function(a, b) {
  if (b == 0)
    return Math.abs(a) < .0001;
  else if (a == 0)
    return Math.abs(b) < .0001;

  if (a < 0) {
    if (b > 0)
      return false;
    a = -a;
    b = -b;
  } else if (b < 0)
    return false;

  return Math.abs(log10(a) - log10(b)) < .0001;
};


/**
 * If a is "very close" to zero, return 0. This ensures that logic which is dependent on values being 
 * negative, non-positive, non-negative, or positive respond correctly to values that should be zero but 
 * are slightly above or below it due to floating-point precision.
 * @param {number} a
 * @return {number}
 */
nmlorg.math.numbers.norm = function(a) {
  if (nmlorg.math.numbers.equal(a, 0))
    return 0;
  return a;
};


/**
 * Sort (and dedupe) an array of numbers. If two neighbors are close to each other (see 
 * {@link nmlorg.math.numbers.equal}), if one is an exact integer it is preserved, otherwise the two are 
 * averaged.
 * @param {Array.<number>} ar
 * @return {Array.<number>}
 */
nmlorg.math.numbers.sorted = function(ar) {
  if ((ar.length == 0) || (ar.length == 1))
    return ar;

  ar = ar.slice().sort(function(a, b) { return a - b; });
  var ret = [ar[0]];

  for (var i = 1; i < ar.length; i++)
    if (nmlorg.math.numbers.equal(ar[i], ret[ret.length - 1])) {
      if (nmlorg.isInt(ar[i]))  // Prefer integers.
        ret[ret.length - 1] = ar[i];
      else if (!nmlorg.isInt(ret[ret.length - 1]))
        ret[ret.length - 1] = (ret[ret.length - 1] + ar[i]) / 2;
    } else
      ret.push(ar[i]);
  return ret;
};


})();
