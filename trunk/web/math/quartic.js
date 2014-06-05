/**
 * @fileoverview Quartic equation solver.
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg.require('nmlorg.math.cubic');
nmlorg.require('nmlorg.math.numbers');
nmlorg.require('nmlorg.math.quadratic');

/** @namespace */
nmlorg.math.quartic = nmlorg.math.quartic || {};


/**
 * Solve equations in the form ax<sup>4</sup> + bx<sup>3</sup> + cx<sup>2</sup> + dx + c = 0 for zero to 
 * four values of x.
 * @param {number} a The coefficient for <code>x<sup>4</sup></code>.
 * @param {number} b The coefficient for <code>x<sup>3</sup></code>.
 * @param {number} c The coefficient for <code>x<sup>2</sup></code>.
 * @param {number} d The coefficient for <code>x</code>.
 * @param {number} e The constant.
 * @return {Array.<number>} [r1, r2, r3, r4] such that ax<sup>4</sup> + bx<sup>3</sup> + cx<sup>2</sup> 
 *     + dx + e = (x - r1)(x - r2)(x - r3)(x - r4).
 * @see https://en.wikipedia.org/wiki/Quartic_function#Solving_a_quartic_equation
 */
nmlorg.math.quartic.solve = function(a, b, c, d, e) {
  if (nmlorg.math.numbers.equal(a, 0))  // bx^3 + cx^2 + dx + e
    return nmlorg.math.cubic.solve(b, c, d, e);

  if (nmlorg.math.numbers.equal(e, 0)) {  // ax^4 + bx^3 + cx^2 + dx = x(ax^3 + bx^2 + cx + d)
    var roots = nmlorg.math.cubic.solve(a, b, c, d);

    roots.push(0);
    return nmlorg.math.numbers.sorted(roots);
  }

  if (nmlorg.math.numbers.equal(b, 0) && nmlorg.math.numbers.equal(d, 0))  // ax^4 + cx^2 + e
    return nmlorg.math.quartic.solveBiquadratic(a, c, e);

  if (nmlorg.math.numbers.equal(a, 1) && nmlorg.math.numbers.equal(b, 0))  // x^3 + cx^2 + dx + e
    return nmlorg.math.quartic.solveDepressed(c, d, e);

  var roots = nmlorg.math.quartic.solveDepressed(
      (8 * c * a - 3 * b * b) / (8 * a * a),
      (b * b * b - 4 * a * b * c + 8 * a * a * d) / (8 * a * a * a),
      (-3 * b * b * b * b + 256 * a * a * a * e - 64 * a * a * b * d + 16 * a * b * b * c) / (256 * a * a * a * a));

  for (var i = 0; i < roots.length; i++)
    roots[i] -= b / (4 * a);

  return nmlorg.math.numbers.sorted(roots);
};


/**
 * Solve equations in the form x<sup>4</sup> + px<sup>2</sup> + qx + r = 0 for zero to four values of x.
 * @param {number} p The coefficient for <code>x<sup>2</sup></code>.
 * @param {number} q The coefficient for <code>x</code>.
 * @param {number} r The constant.
 * @return {Array.<number>}
 * @see http://en.wikipedia.org/wiki/Quartic_formula#Ferrari.27s_solution
 */
nmlorg.math.quartic.solveDepressed = function(p, q, r) {
  if (nmlorg.math.numbers.equal(q, 0))  // x^4 + px^2 + r
    return nmlorg.math.quartic.solveBiquadratic(1, p, r);

  var roots = nmlorg.math.cubic.solve(
      1,
      5 * p / 2,
      2 * p * p - r,
      p * p * p / 2 - p * r / 2 - q * q / 8);
  var ret = [];

  for (var i = 0; i < roots.length; i++) {
    var y = roots[i];
    var left = p + 2 * y;

    if (nmlorg.math.numbers.equal(left, 0))
      continue;
    left = Math.sqrt(left);

    var right = 2 * q / left;
    var a = nmlorg.math.numbers.norm(-(3 * p + 2 * y - right));
    var b = nmlorg.math.numbers.norm(-(3 * p + 2 * y + right));
    var ret = [];

    if (a >= 0) {
      ret.push((-left - Math.sqrt(a)) / 2);
      ret.push((-left + Math.sqrt(a)) / 2);
    }
    if (b >= 0) {
      ret.push((left - Math.sqrt(b)) / 2);
      ret.push((left + Math.sqrt(b)) / 2);
    }
    return nmlorg.math.numbers.sorted(ret);
  }

  return [];
};


/**
 * Solve equations in the form ax<sup>4</sup> + cx<sup>2</sup> + e = 0 for zero to four values of x.
 * @param {number} a The coefficient for <code>x<sup>4</sup></code>.
 * @param {number} c The coefficient for <code>x<sup>2</sup></code>.
 * @param {number} e The constant.
 * @return {Array.<number>}
 * @see http://en.wikipedia.org/wiki/Quartic_formula#Biquadratic_equations
 */
nmlorg.math.quartic.solveBiquadratic = function(a, c, e) {
  var roots = nmlorg.math.quadratic.solve(a, c, e);
  var ret = [];

  for (var i = 0; i < roots.length; i++) {
    if (nmlorg.math.numbers.equal(roots[i], 0)) {
      ret.push(0);
    } else if (roots[i] > 0) {
      ret.push(-Math.sqrt(roots[i]));
      ret.push(Math.sqrt(roots[i]));
    }
  }
  return nmlorg.math.numbers.sorted(ret);
};


})();
