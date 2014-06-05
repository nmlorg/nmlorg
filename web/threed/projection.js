/**
 * @fileoverview Camera matrix utilities.
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
nmlorg.threed.projection = nmlorg.threed.projection || {};


nmlorg.threed.projection.calcAspectRatio = function(width, height) {
  return width / height;
};


/**
 * WebGL (and glMatrix.js) expect matrices in the form:<pre>
 *   A  B  C  D
 *   E  F  G  H
 *   I  J  K  L
 *   M  N  O  P
 * </pre> to be sent a row at a time, as [A, E, I, M, B, F, J, N, C, G, K, O, D, H, L, P].
 * @param {Array.<number>} matrix A flat 4x4 matrix in column-at-a-time format.
 * @return {Float32Array} matrix in row-at-a-time format.
 */
nmlorg.threed.projection.toGLMatrix = function(matrix) {
  return new Float32Array([
      matrix[0], matrix[4], matrix[8], matrix[12],
      matrix[1], matrix[5], matrix[9], matrix[13],
      matrix[2], matrix[6], matrix[10], matrix[14],
      matrix[3], matrix[7], matrix[11], matrix[15],
  ]);
};


/**
 * Reverse {@link nmlorg.threed.projection.toGLMatrix}.
 * @param {Array.<number>} matrix A flat 4x4 matrix in row-at-a-time format.
 * @return {Array.<number>} matrix in column-at-a-time format.
 */
nmlorg.threed.projection.fromGLMatrix = function(matrix) {
  return [
      matrix[0], matrix[4], matrix[8], matrix[12],
      matrix[1], matrix[5], matrix[9], matrix[13],
      matrix[2], matrix[6], matrix[10], matrix[14],
      matrix[3], matrix[7], matrix[11], matrix[15],
  ];
};


/** @constructor */
nmlorg.threed.projection.Projection = function() {};


/**
 * Compile the underlying projection into a 4x4 projection matrix R, such that R [x, y, z, 1] provides 
 * the 2D screen coordinate for [x, y, z].
 * @return {Array.<number>} The flat, row-at-a-time 4x4 projection matrix.
 * @see nmlorg.threed.projection.toGLMatrix
 */
nmlorg.threed.projection.Projection.prototype.toMatrix = function() {
  return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
  ];
};


/**
 * A viewing frustum (a 3D trapezoid; a possibly slanted pyramid with the top chopped off, but with the 
 * position where the top would be at the origin). The left, right, bottom, and top coordinates of the 
 * far plane are determined by drawing a line from the top point through the corresponding near-plane 
 * coordinates.
 * @constructor
 * @extends nmlorg.threed.projection.Projection
 * @param {number} left The x coordinate of the left edge of the near plane.
 * @param {number} right The x coordinate of the right edge of the near plane.
 * @param {number} bottom The y coordinate of the bottom edge of the near plane.
 * @param {number} top The y coordinate of the top edge of the near plane.
 * @param {number} [nearPlane] The z coordinate of the near plane relative to the top point.
 * @param {number} [farPlane] The z coordinate of the far plane relative to the top point.
 * @param {number} [extraDepth] The distance from the top point to the camera.
 */
nmlorg.threed.projection.Frustum = function(left, right, bottom, top, nearPlane, farPlane, extraDepth) {
  if (nearPlane === undefined)
    nearPlane = 1;
  if (farPlane === undefined)
    farPlane = 10000;
  if (extraDepth === undefined)
    extraDepth = 0;

  this.top = top;
  this.bottom = bottom;
  this.right = right;
  this.left = left;
  this.nearPlane = nearPlane;
  this.farPlane = farPlane;
  this.extraDepth = extraDepth;
};
nmlorg.threed.projection.Frustum.prototype = Object.create(nmlorg.threed.projection.Projection.prototype);


/**
 * Create a frustum shaped based on the given field of view.
 * @param {number} fieldOfView The field of view from bottom to top.
 * @param {number} aspectRatio The ratio of the width to the height of the canvas.
 * @param {number} nearPlane The z coordinate of the near plane.
 * @param {number} farPlane The z coordinate of the far plane.
 */
nmlorg.threed.projection.Frustum.fromPerspective = function(fieldOfView, aspectRatio, nearPlane, farPlane) {
  if (nearPlane === undefined)
    nearPlane = .1;
  if (farPlane === undefined)
    farPlane = 10000;

  var top = nearPlane * Math.tan(nmlorg.degToRad(fieldOfView / 2));
  var bottom = -top;
  var right = top * aspectRatio;
  var left = -right;

  return new nmlorg.threed.projection.Frustum(left, right, bottom, top, nearPlane, farPlane);
};


nmlorg.threed.projection.Frustum.prototype.toPerspective = function() {
  if ((this.left != -this.right) || (this.bottom != -this.top))
    throw 'This frustum is not a centered isosceles trapezoid.';

  var fieldOfView = nmlorg.radToDeg(2 * Math.atan(this.top / this.nearPlane));
  var aspectRatio = this.right / this.top;

  return [fieldOfView, aspectRatio, this.nearPlane, this.farPlane];
};


/**
 * Create a frustum that approximates a {@link nmlorg.threed.projection.Box}.
 * @param {number} left The x coordinate of the left edge of the near plane.
 * @param {number} right The x coordinate of the right edge of the near plane.
 * @param {number} bottom The y coordinate of the bottom edge of the near plane.
 * @param {number} top The y coordinate of the top edge of the near plane.
 * @param {number} nearPlane The z coordinate of the near plane.
 * @param {number} farPlane The z coordinate of the far plane.
 */
nmlorg.threed.projection.Frustum.fromOrtho = function(left, right, bottom, top, nearPlane, farPlane) {
  return new nmlorg.threed.projection.Frustum(left, right, bottom, top, nearPlane + 10 * farPlane, 11 * farPlane, 10 * farPlane);
};


/** @override */
nmlorg.threed.projection.Frustum.prototype.toMatrix = function() {
  var width = this.right - this.left;
  var height = this.top - this.bottom;
  var depth = this.farPlane - this.nearPlane;
  var a = (this.right + this.left) / width;
  var b = (this.top + this.bottom) / height;
  var c = -(this.farPlane + this.nearPlane) / depth;
  var d = -2 * this.farPlane * this.nearPlane / depth + c * -this.extraDepth;
  var x = 2 * this.nearPlane / width;
  var y = 2 * this.nearPlane / height;

  return [
      x, 0, a, 0,
      0, y, b, 0,
      0, 0, c, d,
      0, 0, -1, this.extraDepth,
  ];
};


/*
nmlorg.threed.projection.Frustum.prototype.fromMatrix = function(matrix) {
  if (matrix[1] || matrix[3] || matrix[4] || matrix[7] || matrix[8] ||
      matrix[9] || matrix[12] || matrix[13] || (matrix[14] != -1))
    throw 'Matrix in wildly non-normal form.';

  var a = matrix[2];
  var b = matrix[6];
  var c = matrix[10];
  var d = matrix[11];
  var x = matrix[0];
  var y = matrix[5];
  var extraDepth = matrix[15];
  var aspectRatio = y / x;
  // d = -2 * farPlane * nearPlane / depth + c * -extraDepth
  // d + c * extraDepth = -2 * farPlane * nearPlane / depth
  // depth * (d + c * extraDepth) = -2 * farPlane * nearPlane
  // depth = -2 * farPlane * nearPlane / (d + c * extraDepth)
  // farPlane - nearPlane = -2 * farPlane * nearPlane / (d + c * extraDepth)
  // nearPlane - farPlane = 2 * farPlane * nearPlane / (d + c * extraDepth)
  // nearPlane = 2 * farPlane * nearPlane / (d + c * extraDepth) + farPlane
  // nearPlane = nearPlane * 2 * farPlane / (d + c * extraDepth) + nearPlane * farPlane / nearPlane
  // nearPlane = nearPlane * (2 * farPlane / (d + c * extraDepth) + farPlane / nearPlane)
  // 1 = 2 * farPlane / (d + c * extraDepth) + farPlane / nearPlane
  // 1 - farPlane / nearPlane = 2 * farPlane / (d + c * extraDepth)
  // farPlane / nearPlane - 1 = -2 * farPlane / (d + c * extraDepth)
  // farPlane / nearPlane = -2 * farPlane / (d + c * extraDepth) + 1
  // nearPlane / farPlane = -1 / (2 * farPlane / (d + c * extraDepth) + 1)
  // nearPlane = -farPlane / (2 * farPlane / (d + c * extraDepth) + 1)
  // nearPlane = -farPlane / ((2 * farPlane + d + c * extraDepth) / (d + c * extraDepth))
  // nearPlane = -farPlane * (d + c * extraDepth) / (2 * farPlane + d + c * extraDepth)
  var nearPlane = (d + c * extraDepth) / -2;
  var width = 2 * nearPlane / x;
  var height = 2 * nearPlane / y;
};
*/


/**
 * @constructor
 * @extends nmlorg.threed.projection.Projection
 * @param {number} left The x coordinate of the left edge of the near and far planes.
 * @param {number} right The x coordinate of the right edge of the near and far planes.
 * @param {number} bottom The y coordinate of the bottom edge of the near and far planes.
 * @param {number} top The y coordinate of the top edge of the near and far planes.
 * @param {number} [nearPlane] The z coordinate of the near plane relative to the top point.
 * @param {number} [farPlane] The z coordinate of the far plane relative to the top point.
 */
nmlorg.threed.projection.Box = function(left, right, bottom, top, nearPlane, farPlane) {
  if (nearPlane === undefined)
    nearPlane = .1;
  if (farPlane === undefined)
    farPlane = 10000;

  this.top = top;
  this.bottom = bottom;
  this.right = right;
  this.left = left;
  this.nearPlane = nearPlane;
  this.farPlane = farPlane;
};
nmlorg.threed.projection.Box.prototype = Object.create(nmlorg.threed.projection.Projection.prototype);


/** @override */
nmlorg.threed.projection.Box.prototype.toMatrix = function() {
  var width = this.right - this.left;
  var height = this.top - this.bottom;
  var depth = this.farPlane - this.nearPlane;
  var a = -(this.right + this.left) / width;
  var b = -(this.top + this.bottom) / height;
  var c = -(this.farPlane + this.nearPlane) / depth;
  var x = 2 / width;
  var y = 2 / height;
  var z = -2 / depth;

  return [
      x, 0, 0, a,
      0, y, 0, b,
      0, 0, z, c,
      0, 0, 0, 1,
  ];
};


})();
