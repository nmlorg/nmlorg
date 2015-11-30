/**
 * @fileoverview A model of a vehicle's position and orientation.
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
spacex = window.spacex || {};


/**
 * A model of the vehicle's position and orientation.
 * @constructor
 */
spacex.Vehicle = function(vals) {
  for (var k in vals)
    this[k] = vals[k];
};


spacex.Vehicle.prototype.velocity = 0;
spacex.Vehicle.prototype.yaw = 0;
spacex.Vehicle.prototype.pitch = 0;
spacex.Vehicle.prototype.roll = 0;
spacex.Vehicle.prototype.lat = 0;
spacex.Vehicle.prototype.lon = 0;
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
  var dx = velTime * Math.cos(pitchRad) * Math.cos(yawRad);
  var dy = velTime * Math.cos(pitchRad) * Math.sin(yawRad);
  var dz = velTime * Math.sin(pitchRad);

  this.lat += dy / 110575;
  while (this.lat < -90)
    this.lat += 180;
  while (this.lat > 90)
    this.lt -= 180;

  this.lon += dx / 111320 / Math.cos(this.lat * Math.PI / 180);
  while (this.lon < -180)
    this.lon += 360;
  while (this.lon > 180)
    this.lon -= 360;

  this.z += dz;
};

})();
