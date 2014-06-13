/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
nmlorg.io.orient = nmlorg.io.orient || {};


/**
 * The current state of the device's orientation and active motion.
 * @constructor
 */
nmlorg.io.orient.Listener = function() {
  window.addEventListener('deviceorientation', this.handleDeviceOrientation_.bind(this));
  window.addEventListener('devicemotion', this.handleDeviceMotion_.bind(this));
  window.addEventListener('resetcontrols', this.reset.bind(this));
};


nmlorg.io.orient.Listener.prototype.x = 0;
nmlorg.io.orient.Listener.prototype.y = 0;
nmlorg.io.orient.Listener.prototype.z = 0;
nmlorg.io.orient.Listener.prototype.dx = 0;
nmlorg.io.orient.Listener.prototype.dy = 0;
nmlorg.io.orient.Listener.prototype.dz = 0;


/**
 * Give all future readings relative to the current orientation.
 */
nmlorg.io.orient.Listener.prototype.reset = function() {
  this.initial_ = false;
};


nmlorg.io.orient.Listener.prototype.handleDeviceOrientation_ = function(ev) {
  if (!this.initial_) {
    this.initial_ = {
        'z': ev.alpha,
        'x': ev.beta,
        'y': ev.gamma,
    };
    return;
  }

  this.z = ev.alpha - this.initial_.z;
  this.x = ev.beta - this.initial_.x;
  this.y = ev.gamma - this.initial_.y;
};


nmlorg.io.orient.Listener.prototype.handleDeviceMotion_ = function(ev) {
  this.dz = ev.rotationRate.alpha;
  this.dx = ev.rotationRate.beta;
  this.dy = ev.rotationRate.gamma;
};


})();
