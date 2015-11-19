/**
 * @fileoverview A model of in-atmosphere vehicle navigation.
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
spacex = window.spacex || {};


var p0 = 101.325;  // sea level standard atmospheric pressure, 101.325 kPa
var T0 = 288.15;  // sea level standard temperature, 288.15 K
var g = 9.80665;  // earth-surface gravitational acceleration, 9.80665 m/s2
var L = 0.0065;  // temperature lapse rate, 0.0065 K/m
var R = 8.31447;  // ideal (universal) gas constant, 8.31447 J/(mol·K)
var M = 0.0289644;  // molar mass of dry air, 0.0289644 kg/mol


/**
 * Estimate the temperature at elevation h (in meters) above sea level.
 * @param {number} h Height above sea level in meters.
 * @see https://en.wikipedia.org/wiki/Density_of_air#Altitude
 */
spacex.guessTemp = function(h) {
  return Math.max(T0 - L * h, 2.7);  // "Space" is 2.7 K.
};


/**
 * Estimate the air pressure at elevation h (in meters) above sea level.
 * @param {number} h Height above sea level in meters.
 * @see https://en.wikipedia.org/wiki/Density_of_air#Altitude
 */
spacex.guessPressure = function(h) {
  return p0 * (Math.pow(1 - Math.max(L * h / T0, 0), g * M / (R * L)) || 0);
};


/**
 * Estimate the air density (kg per cubic meter) at elevation h (in meters) above sea level.
 * @param {number} h Height above sea level in meters.
 * @see https://en.wikipedia.org/wiki/Density_of_air#Altitude
 */
spacex.guessAirDensity = function(h) {
  return 1000 * spacex.guessPressure(h) * M / (R * spacex.guessTemp(h));
};


/**
 * Estimate the coefficient of lift at a given angle of attack.
 * @param {number} C_L_0 The coefficient of lift (0 through 2) for the vehicle with an angle of
 *     attack of 0.
 * @param {number} C_L_i A stability derivative that defines the slope of the lift curve line.
 * @param {number} i The angle of attack in degrees.
 * @see http://www.aerospaceweb.org/question/aerodynamics/q0252.shtml
 */
spacex.guessLiftCoef = function(C_L_0, C_L_i, i) {
  return C_L_0 + C_L_i * i * Math.PI / 180;
};


/**
 * Estimate the lift generated based on the given parameters.
 * @param {number} C_L The coefficient of lift (0 through 2) for the vehicle/configuration.
 * @param {number} h Height above sea level in meters.
 * @param {number} v Vehicle true airspeed in meters per second.
 * @param {number} s Surface area of the wing in square meters.
 * @see http://www.ppl-flight-training.com/lift-formula.html
 */
spacex.guessLift = function(C_L, h, v, s) {
  return C_L * spacex.guessAirDensity(h) / 2 * v * v * s;
};


/**
 * A model of a vehicle flying within the Earth's atmosphere.
 * @param {number} C_L_0 The coefficient of lift (0 through 2) for the vehicle with an angle of
 *     attack of 0.
 * @param {number} C_L_i A stability derivative that defines the slope of the lift curve line.
 * @param {number} s Surface area of the wing in square meters.
 * @param {number} weight Weight of the vehicle in Newtons.
 * @constructor
 */
spacex.LiftVehicle = function(C_L_0, C_L_i, s, weight) {
  this.C_L_0 = C_L_0;
  this.C_L_i = C_L_i;
  this.s = s;
  this.weight = weight;
};


/**
 * Estimate the lift generated based on the given parameters.
 * @param {number} h Height above sea level in meters.
 * @param {number} v Vehicle true airspeed in meters per second.
 * @param {number} i Pitch or angle of attack.
 */
spacex.LiftVehicle.prototype.guessLiftForce = function(h, v, i) {
  var C_L = spacex.guessLiftCoef(this.C_L_0, this.C_L_i, i);

  return spacex.guessLift(C_L, h, v, this.s) - this.weight;
};


/**
 * Estimate the lift generated as a fraction of vehicle weight.
 * @param {number} h Height above sea level in meters.
 * @param {number} v Vehicle true airspeed in meters per second.
 * @param {number} i Pitch or angle of attack.
 */
spacex.LiftVehicle.prototype.guessLiftFraction = function(h, v, i) {
  return this.guessLiftForce(h, v, i) / this.weight;
};

})();
