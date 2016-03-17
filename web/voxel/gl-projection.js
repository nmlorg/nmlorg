/**
 * @fileoverview Camera matrix utilities.
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


/** @namespace */
nmlorg.gl = nmlorg.gl || {};


/**
 * A viewing frustum (a 3D trapezoid; a possibly slanted pyramid with the top chopped off, but with
 * the position where the top would be at the origin). The left, right, bottom, and top coordinates
 * of the far plane are determined by drawing a line from the top point through the corresponding
 * near-plane coordinates.
 * @param {number} left The x coordinate of the left edge of the near plane.
 * @param {number} right The x coordinate of the right edge of the near plane.
 * @param {number} bottom The y coordinate of the bottom edge of the near plane.
 * @param {number} top The y coordinate of the top edge of the near plane.
 * @param {number} [nearPlane] The z coordinate of the near plane relative to the top point.
 * @param {number} [farPlane] The z coordinate of the far plane relative to the top point.
 * @param {number} [extraDepth] The distance from the top point to the camera.
 */
nmlorg.gl.makeFrustum = function(left, right, bottom, top, nearPlane, farPlane, extraDepth) {
  if (nearPlane === undefined)
    nearPlane = 1;
  if (farPlane === undefined)
    farPlane = 10000;
  if (extraDepth === undefined)
    extraDepth = 0;

  var width = right - left;
  var height = top - bottom;
  var depth = farPlane - nearPlane;
  var a = (right + left) / width;
  var b = (top + bottom) / height;
  var c = -(farPlane + nearPlane) / depth;
  var d = -2 * farPlane * nearPlane / depth + c * -extraDepth;
  var x = 2 * nearPlane / width;
  var y = 2 * nearPlane / height;

  return [
      x, 0, a, 0,
      0, y, b, 0,
      0, 0, c, d,
      0, 0, -1, extraDepth,
  ];
};

})();
