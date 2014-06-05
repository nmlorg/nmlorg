/**
 * @fileoverview Quadratic equation solver.
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg.require('nmlorg.math.numbers');

/** @namespace */
nmlorg.math.quadratic = nmlorg.math.quadratic || {};


/**
 * a / abs(a)
 * @param {number} a A number.
 * @return {number}
 */
function sgn(a) {
  if (a < 0)
    return -1;
  return 1;
}


/**
 * Solve equations in the form ax<sup>2</sup> + bx + c = 0 for zero, one, or two non-complex values of 
 * x.
 * @param {number} a The coefficient for <code>x<sup>2</sup></code>.
 * @param {number} b The coefficient for <code>x</code>.
 * @param {number} c The constant.
 * @return {Array.<number>} [r1, r2] such that ax<sup>2</sup> + bx + c = (x - r1)(x - r2).
 * @see http://en.wikipedia.org/wiki/Quadratic_formula#Floating-point_implementation
 */
nmlorg.math.quadratic.solve = function(a, b, c) {
  if (nmlorg.math.numbers.equal(a, 0))  // bx + c = 0
    return [-c / b];

  if (nmlorg.math.numbers.equal(b, 0)) {  // ax^2 + c = 0
    if (nmlorg.math.numbers.equal(c, 0))  // ax^2 = 0
      return [0];
    return [-Math.sqrt(-c / a), Math.sqrt(-c / a)];
  }

  var discriminant = nmlorg.math.numbers.norm(b * b - 4 * a * c);

  if (discriminant == 0) {
    return [-b / (2 * a)];
  } else if (discriminant > 0) {
    var q = (b + sgn(b) * Math.sqrt(discriminant)) / -2;
    var roots = [q / a, c / q];

    return nmlorg.math.numbers.sorted(roots);
  } else {
    // http://en.wikipedia.org/wiki/Quadratic_formula#Discriminant
    return [];
  }
};


})();
