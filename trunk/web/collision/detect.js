/**
 * @fileoverview Routines related to detecting (predicting) collisions inside a 3D world.
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg.require('nmlorg.math.quartic');

/** @namespace */
nmlorg.collision.detect = nmlorg.collision.detect || {};


/**
 * Calculate the time (in the same units as given by v*) at which a sphere at [dx, dy, dz] of radius rad 
 * traveling at [vx, vy, vz] will collide with the origin, if ever.
 * @param {number} dx The x-axis position of the sphere.
 * @param {number} dy The y-axis position of the sphere.
 * @param {number} dz The z-axis position of the sphere.
 * @param {number} vx The x-axis velocity of the sphere.
 * @param {number} vy The y-axis velocity of the sphere.
 * @param {number} vz The z-axis velocity of the sphere.
 * @param {number} ax The x-axis acceleration of the sphere.
 * @param {number} ay The y-axis acceleration of the sphere.
 * @param {number} az The z-axis acceleration of the sphere.
 * @param {number} rad The radius of the sphere.
 * @return {number|undefined}
 */
nmlorg.collision.detect.timeToOrigin = function(dx, dy, dz, vx, vy, vz, ax, ay, az, rad) {
  if (dx * dx + dy * dy + dz * dz < rad * rad)
    // The origin is inside the sphere.
    return -Infinity;

  var a = ax * ax + ay * ay + az * az;
  var b = ax * vx + ay * vy + az * vz;
  var c = dx * ax + vx * vx + dy * ay + vy * vy + dz * az + vz * vz;
  var d = 2 * (dx * vx + dy * vy + dz * vz);
  var e = dx * dx + dy * dy + dz * dz - rad * rad;
  var roots = nmlorg.math.quartic.solve(a, b, c, d, e);

  // If there are no roots, the sphere will never intercept the origin.
  // If there is one root, the sphere will touch the origin at one point, with no transfer of inertia.
  // If there are two roots and both are non-negative, the origin will enter the sphere at roots[0] and, 
  // if the velocity is not adjusted, will exit at roots[1].
  if ((roots.length >= 2) && (roots[0] >= 0))
    return roots[0];
  else if ((roots.length >= 4) && (roots[2] >= 0))
    return roots[2];
};


/** @constructor */
nmlorg.collision.detect.Shape = function() {};


/**
 * @abstract
 * @param {nmlorg.physics.Object} obj1
 * @param {nmlorg.physics.Object} obj2
 * @param {nmlorg.collision.detect.Shape} shape2
 */
nmlorg.collision.detect.Shape.prototype.timeToCollision = function(obj1, obj2, shape2) {};


/**
 * @constructor
 * @extends nmlorg.collision.detect.Shape
 */
nmlorg.collision.detect.Sphere = function(radius) {
  this.radius = radius;
};
nmlorg.collision.detect.Sphere.prototype = Object.create(nmlorg.collision.detect.Shape.prototype);


/** @override */
nmlorg.collision.detect.Sphere.prototype.timeToCollision = function(obj1, obj2, shape2) {
  var dx = obj1.position[0] - obj2.position[0];
  var dy = obj1.position[1] - obj2.position[1];
  var dz = obj1.position[2] - obj2.position[2];
  var vx = obj1.velocity[0] - obj2.velocity[0];
  var vy = obj1.velocity[1] - obj2.velocity[1];
  var vz = obj1.velocity[2] - obj2.velocity[2];
  var ax = 0, ay = 0, az = 0;
  var rad = this.radius + shape2.radius;

  for (var i = 0; i < obj1.forces.length; i++) {
    ax += obj1.forces[i][0];
    ay += obj1.forces[i][1];
    az += obj1.forces[i][2];
  }

  for (var i = 0; i < obj2.forces.length; i++) {
    ax -= obj2.forces[i][0];
    ay -= obj2.forces[i][1];
    az -= obj2.forces[i][2];
  }

  return nmlorg.collision.detect.timeToOrigin(dx, dy, dz, vx, vy, vz, ax, ay, az, rad);
};


})();
