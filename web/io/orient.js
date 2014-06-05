/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
nmlorg.io.orient = nmlorg.io.orient || {};


nmlorg.io.orient.Listener = function() {
  window.addEventListener('deviceorientation', this.handleDeviceOrientation.bind(this));
  window.addEventListener('devicemotion', this.handleDeviceMotion.bind(this));
  window.addEventListener('resetcontrols', this.reset.bind(this));
};


nmlorg.io.orient.Listener.prototype.x = 0;
nmlorg.io.orient.Listener.prototype.y = 0;
nmlorg.io.orient.Listener.prototype.z = 0;
nmlorg.io.orient.Listener.prototype.dx = 0;
nmlorg.io.orient.Listener.prototype.dy = 0;
nmlorg.io.orient.Listener.prototype.dz = 0;


nmlorg.io.orient.Listener.prototype.reset = function() {
  this.initial_ = false;
};


nmlorg.io.orient.Listener.prototype.handleDeviceOrientation = function(ev) {
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


nmlorg.io.orient.Listener.prototype.handleDeviceMotion = function(ev) {
  this.dz = ev.rotationRate.alpha;
  this.dx = ev.rotationRate.beta;
  this.dy = ev.rotationRate.gamma;
};


})();
