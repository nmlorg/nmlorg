/**
 * @fileoverview Routines related to responding to collisions between objects in 3D space.
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg.require('mat4');


/** @namespace */
nmlorg.collision.response = nmlorg.collision.response || {};


/**
 * Transform the vector [vx, vy, vz] to an alternate coordinate system where the positive x axis runs 
 * through the point [dx, dy, dz]. This is done by constructing a rotation matrix R such that 
 * R [dx, dy, dz] = [sqrt(dx<sup>2</sup> + dy<sup>2</sup> + dz<sup>2</sup>), 0, 0] and returning R [vx, 
 * vy, vz].
 * @param {number} dx The original x component of the new x axis.
 * @param {number} dy The original y component of the new x axis.
 * @param {number} dz The original z component of the new x axis.
 * @param {number} vx The original x component of the vector/point to transform.
 * @param {number} vy The original y component of the vector/point to transform.
 * @param {number} vz The original z component of the vector/point to transform.
 * @return {Array.<number, number, number>} [vx', vy', vz']
 */
nmlorg.collision.response.transformVelocity = function(dx, dy, dz, vx, vy, vz) {
  var xyAng = Math.atan2(dy, dx);
  var xyMag = Math.sqrt(dx * dx + dy * dy);
  var xzAng = -Math.atan2(dz, xyMag);
  var R = mat4.create();

  mat4.identity(R);
  mat4.rotate(R, -xyAng, [0, 0, 1]);
  mat4.rotate(R, -xzAng, [0, 1, 0]);
  mat4.translate(R, [vx, vy, vz]);

  //console.log('transformVelocity(' + dx + ', ' + dy + ', ' + dz + ', ' + vx + ', ' + vy + ', ' + vz + ') = [' + R[12] + ', ' + R[13] + ', ' + R[14] + ']');
  return [R[12], R[13], R[14]];
};


/**
 * Transform the vector [vx, vy, vz] from a coordinate system where the positive x axis runs through the 
 * point [dx, dy, dz] to the standard coordinate system. This is the same as 
 * {@link nmlorg.collision.response.transformVelocity} using the axis [dx, dy, dz] reflected across the x axis, 
 * i.e. [dx, -dy, -dz].
 * @param {number} dx The original x component of the new x axis.
 * @param {number} dy The original y component of the new x axis.
 * @param {number} dz The original z component of the new x axis.
 * @param {number} vx' The transformed x component of the vector/point to restore.
 * @param {number} vy' The transformed y component of the vector/point to restore.
 * @param {number} vz' The transformed z component of the vector/point to restore.
 * @return {Array.<number, number, number>} [vx, vy, vz]
 */
nmlorg.collision.response.restoreVelocity = function(dx, dy, dz, vx, vy, vz) {
  return nmlorg.collision.response.transformVelocity(dx, -dy, -dz, vx, vy, vz);
};


/**
 * Handle a collision between two objects, or masses m1 and m2, with speeds along the collision 
 * dimension of v1 and v2.
 * @param {number} m1
 * @param {number} v1
 * @param {number} m2
 * @param {number} v2
 * @param {number} elastic
 * @param {number} inelastic
 * @param {number} heat
 * @return {Array.<number, number>} [v1', v2']
 */
nmlorg.collision.response.handleCollision = function(m1, v1, m2, v2, elastic, inelastic, heat) {
  if (heat >= 1)  // All energy is dissipated.
    return [0, 0];

  if ((m1 == Infinity) && (m2 == Infinity))
    // Two unmoveable objects. This should be impossible.
    return [0, 0];

  if (elastic + inelastic == 0)
    // For some reason elastic + inelastic + heat != 1, but this should be treated as heat = 1.
    return [0, 0];

  v1 *= (1 - heat);
  v2 *= (1 - heat);

  var COR = elastic / (elastic + inelastic);

  if (m1 == Infinity)
    return [0, COR * -v2];
  else if (m2 == Infinity)
    return [COR * -v1, 0];

  return [
      (m1 * v1 + m2 * v2 + m2 * COR * (v2 - v1)) / (m1 + m2),
      (m1 * v1 + m2 * v2 + m1 * COR * (v1 - v2)) / (m1 + m2),
  ];
};


/** @constructor */
nmlorg.collision.response.Material = function(elastic, inelastic, heat) {
  var mag = elastic + inelastic + heat;

  this.elastic = elastic / mag;
  this.inelastic = inelastic / mag;
  this.heat = heat / mag;
};


/**
 * Handle a collision between obj1 and obj2. This assumes the point of collision is along the line 
 * between the two objects' centers. 
 * material1.handleCollision(obj1, obj2, material2) == material2.handleCollision(obj2, obj1, material1).
 * @param {nmlorg.physics.Object} obj1
 * @param {nmlorg.physics.Object} obj2
 * @param {nmlorg.collision.response.Material} material2
 * @see nmlorg.collision.response.handleCollision
 */
nmlorg.collision.response.Material.prototype.handleCollision = function(obj1, obj2, material2) {
  var elastic = (this.elastic + material2.elastic) / 2;
  var inelastic = (this.inelastic + material2.inelastic) / 2;
  var heat = (this.heat + material2.heat) / 2;
  var dx = obj1.position[0] - obj2.position[0];
  var dy = obj1.position[1] - obj2.position[1];
  var dz = obj1.position[2] - obj2.position[2];
  var v1 = nmlorg.collision.response.transformVelocity(
      dx, dy, dz, obj1.velocity[0], obj1.velocity[1], obj1.velocity[2]);
  var v2 = nmlorg.collision.response.transformVelocity(
      dx, dy, dz, obj2.velocity[0], obj2.velocity[1], obj2.velocity[2]);
  var m1 = 1, m2 = 1;
  var ret = nmlorg.collision.response.handleCollision(m1, v1[0], m2, v2[0], elastic, inelastic, heat);

  obj1.velocity = nmlorg.collision.response.restoreVelocity(dx, dy, dz, ret[0], v1[1], v1[2]);
  obj2.velocity = nmlorg.collision.response.restoreVelocity(dx, dy, dz, ret[1], v2[1], v2[2]);
};


})();
