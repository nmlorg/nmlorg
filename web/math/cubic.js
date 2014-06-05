/**
 * @fileoverview Cubic equation solver.
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg.require('nmlorg.math.numbers');
nmlorg.require('nmlorg.math.quadratic');

/** @namespace */
nmlorg.math.cubic = nmlorg.math.cubic || {};


/**
 * Solve equations in the form ax<sup>3</sup> + bx<sup>2</sup> + cx + d = 0 for one, two, or three 
 * non-complex values of x.
 * @param {number} a The coefficient for <code>x<sup>3</sup></code>.
 * @param {number} b The coefficient for <code>x<sup>2</sup></code>.
 * @param {number} c The coefficient for <code>x</code>.
 * @param {number} d The constant.
 * @return {Array.<number>} [r1, r2, r3] such that ax<sup>3</sup> + bx<sup>2</sup> + cx + d = (x - r1)(x 
 *     - r2)(x - r3).
 */
nmlorg.math.cubic.solve = function(a, b, c, d) {
  if (nmlorg.math.numbers.equal(a, 0))  // bx^2 + cx + d
    return nmlorg.math.quadratic.solve(b, c, d);

  if (nmlorg.math.numbers.equal(d, 0)) {  // ax^3 + bx^2 + cx = x(ax^2 + bx + c)
    var roots = nmlorg.math.quadratic.solve(a, b, c);

    roots.push(0);
    return nmlorg.math.numbers.sorted(roots);
  }

  if (nmlorg.math.numbers.equal(a, 1) && nmlorg.math.numbers.equal(b, 0))
    return nmlorg.math.cubic.solveDepressed(c, d);

  var roots = nmlorg.math.cubic.solveDepressed(
      (3 * a * c - b * b) / (3 * a * a),
      (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a));

  for (var i = 0; i < roots.length; i++)
    roots[i] -= b / (3 * a);

  return roots;
};


/**
 * Solve equations in the form x<sup>3</sup> + px + q = 0 for one, two, or three values of x.
 * @param {number} p The coefficient for <code>x</code>.
 * @param {number} q The constant.
 * @return {Array.<number>}
 */
nmlorg.math.cubic.solveDepressed = function(p, q) {
  if (nmlorg.math.numbers.equal(p, 0)) {  // x^3 + q = 0
    if (nmlorg.math.numbers.equal(q, 0))  // x^3 = 0
      return [0];
    return [nmlorg.cbrt(-q)];
  }

  if (nmlorg.math.numbers.norm(p) < 0)
    return nmlorg.math.cubic.solveDepressedTrigonometric(p, q);
  return nmlorg.math.cubic.solveDepressedVieta(p, q);
};


/**
 * Solve equations in the form x<sup>3</sup> + px + q = 0, where p < 0, for one, two, or three values of 
 * x.
 * @param {number} p The coefficient for <code>x</code>.
 * @param {number} q The constant.
 * @return {Array.<number>}
 * @see http://en.wikipedia.org/wiki/Cubic_function#Trigonometric_.28and_hyperbolic.29_method
 */
nmlorg.math.cubic.solveDepressedTrigonometric = function(p, q) {
  var left = 2 * Math.sqrt(-p / 3);
  var adjacentHyp = 3 * q * Math.sqrt(-3 / p) / (2 * p);
  if (adjacentHyp > 1)
    adjacentHyp = 1;
  else if (adjacentHyp < -1)
    adjacentHyp = -1;
  var inside = Math.acos(adjacentHyp) / 3;

  return nmlorg.math.numbers.sorted([
      left * Math.cos(inside),
      left * Math.cos(inside - 2 * Math.PI / 3),
      left * Math.cos(inside - 4 * Math.PI / 3),
  ]);
};


/**
 * Solve equations in the form x<sup>3</sup> + px + q = 0, where p > 0, for one value of x.
 * @param {number} p The coefficient for <code>x</code>.
 * @param {number} q The constant.
 * @return {Array.<number>}
 * @see http://en.wikipedia.org/wiki/Cubic_function#Vieta.27s_substitution
 */
nmlorg.math.cubic.solveDepressedVieta = function(p, q) {
  //                 x^3 + px + q = 0
  // Substitute x = w - p / (3 * w):
  //   w^3 + q - p^3 / (27 * w^3) = 0
  // Multiply both sides by w^3:
  //        w^6 + qw^3 - p^3 / 27 = 0
  // This quintic equation is tri-quadratic (w^3 = t):
  //          t^2 + qt - p^3 / 27 = 0
  var roots = nmlorg.math.quadratic.solve(1, q, -p * p * p / 27);
  var w = nmlorg.cbrt(roots[0]);

  return [w - p / (3 * w)];
};


})();
