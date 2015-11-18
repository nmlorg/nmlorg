(function() {

/** @namespace */
spacex = window.spacex || {};


/**
 * A model of the vehicle's position and orientation.
 * @constructor
 */
spacex.Vehicle = function() {
};


spacex.Vehicle.prototype.velocity = 0;
spacex.Vehicle.prototype.yaw = 0;
spacex.Vehicle.prototype.pitch = 0;
spacex.Vehicle.prototype.roll = 0;
spacex.Vehicle.prototype.x = 0;
spacex.Vehicle.prototype.y = 0;
spacex.Vehicle.prototype.z = 0;


/**
 * Advance the vehicle's position by dt seconds.
 * @param {number} dt The amount of time to advance, in seconds.
 */
spacex.Vehicle.prototype.compound = function(dt) {
  while (this.yaw < -180)
    this.yaw += 360;
  while (this.yaw > 180)
    this.yaw -= 360;

  while (this.pitch < -180)
    this.pitch += 360;
  while (this.pitch > 180)
    this.pitch -= 360;

  while (this.roll < -180)
    this.roll += 360;
  while (this.roll > 180)
    this.roll -= 360;

  var velTime = this.velocity * dt;
  var yawRad = (90 - this.yaw) * Math.PI / 180;
  var pitchRad = this.pitch * Math.PI / 180;

  this.x += velTime * Math.cos(pitchRad) * Math.cos(yawRad);
  this.y += velTime * Math.cos(pitchRad) * Math.sin(yawRad);
  this.z += velTime * Math.sin(pitchRad);
};

})();
