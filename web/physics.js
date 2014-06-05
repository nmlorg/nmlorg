/**
 * @fileoverview An object-management system tracking the positions of the centers of mass of objects in 
 * 3D space.
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
nmlorg.physics = nmlorg.physics || {};


/**
 * A model for the center of mass of a massless, dimensionless physical object. (Also see 
 * {@link nmlorg.collision.World#addObject}.)
 * @constructor
 * @param {number} x The object's x coordinate.
 * @param {number} y The object's y coordinate.
 * @param {number} z The object's z coordinate.
 */
nmlorg.physics.Object = function(x, y, z) {
  this.position = [x, y, z];
  this.velocity = [0, 0, 0];
  this.forces = [];
};


/**
 * Update the object's velocity based on its active forces, then update the object's position based on 
 * its velocity. If any forces expire during the given timeStep, the step is subdivided so the position 
 * is updated once for each expiring force.
 * @param {number} timeStep The amount of time (in seconds) that has passed since the last compound.
 */
nmlorg.physics.Object.prototype.compound = function(timeStep) {
  while (timeStep > 0) {
    var minStep = timeStep;

    for (var i = 0; i < this.forces.length; i++) {
      var force = this.forces[i];

      if ((force.duration !== undefined) && (force.duration < minStep))
        minStep = force.duration;
    }
    this.compound_(minStep);
    timeStep -= minStep;
  }
};


nmlorg.physics.Object.prototype.compound_ = function(timeStep) {
  var origvelocity = [this.velocity[0], this.velocity[1], this.velocity[2]];

  for (var i = this.forces.length - 1; i >= 0; i--) {
    var force = this.forces[i];

    if (!force.apply_(this.velocity, timeStep))
      this.forces.splice(i, 1);
  }

  // s[t-1:t] = s[t-1] + v[t] * (t - t-1)
  for (var i = 0; i < 3; i++)
    this.position[i] += (origvelocity[i] + this.velocity[i]) / 2 * timeStep;
};


// http://en.wikipedia.org/wiki/Gravitational_acceleration
nmlorg.physics.g = {  // m / (s * s)
    'Earth': 9.80665 * 10,
};


/**
 * Add a force roughly simulating Earth gravity at the scale of 1 m = 10 pixels.
 */
nmlorg.physics.Object.prototype.addEarthGravity = function() {
  this.addForce(0, -nmlorg.physics.g.Earth, 0);
};


/**
 * Add an indefinite or fixed-duration constant force (acceleration) to the object.
 * @param {number} x The x component of the force.
 * @param {number} y The y component of the force.
 * @param {number} z The z component of the force.
 * @param {number} [duration] The amount of time (in seconds) for the force to apply.
 */
nmlorg.physics.Object.prototype.addForce = function(x, y, z, duration) {
  this.forces.push(new nmlorg.physics.Force(x, y, z, duration));
};


/**
 * An acceleration vector.
 * @constructor
 */
nmlorg.physics.Force = function(x, y, z, duration) {
  this.acceleration = [x, y, z];
  this.duration = duration;
};


nmlorg.physics.Force.prototype.apply_ = function(velocity, timeStep) {
  if (this.duration !== undefined) {
    if (timeStep > this.duration)
      timeStep = this.duration;
    this.duration -= timeStep;
  }

  for (var i = 0; i < 3; i++)
    velocity[i] += this.acceleration[i] * timeStep;

  return (this.duration === undefined) || (this.duration > 0);
};


})();
