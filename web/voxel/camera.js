(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


nmlorg.Camera = function() {
  this.stack_ = [];
  this.push();
};


nmlorg.Camera.prototype.getM_ = function() {
  return this.stack_[this.stack_.length - 1];
};


nmlorg.Camera.prototype.getPos = function(x, y, z) {
  var m = this.multiply([x, y, z || 0, 1]).m_;
  return [m[0] / m[3], m[1] / m[3], m[2] / m[3]];
};


nmlorg.Camera.prototype.multiply = function(rhs) {
  return this.getM_().multiply(rhs);
};


nmlorg.Camera.prototype.multiplySet = function(rhs) {
  this.stack_[this.stack_.length - 1] = this.multiply(rhs);
};


nmlorg.Camera.prototype.pop = function() {
  this.stack_.pop();
  if (!this.stack_.length)
    this.push();
};


nmlorg.Camera.prototype.push = function() {
  this.stack_.push(this.stack_.length ? this.getM_().copy() : nmlorg.Matrix.identity(4, 4));
};


nmlorg.Camera.prototype.rotateX = function(a) {
  var ca = Math.cos(a), sa = Math.sin(a);

  this.multiplySet([1, 0, 0, 0,
                    0, ca, -sa, 0,
                    0, sa, ca, 0,
                    0, 0, 0, 1]);
};


nmlorg.Camera.prototype.rotateY = function(a) {
  var ca = Math.cos(a), sa = Math.sin(a);

  this.multiplySet([ca, 0, sa, 0,
                    0, 1, 0, 0,
                    -sa, 0, ca, 0,
                    0, 0, 0, 1]);
};


nmlorg.Camera.prototype.rotateZ = function(a) {
  var ca = Math.cos(a), sa = Math.sin(a);

  this.multiplySet([ca, -sa, 0, 0,
                    sa, ca, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1]);
};


nmlorg.Camera.prototype.translate = function(x, y, z) {
  this.multiplySet([1, 0, 0, x,
                    0, 1, 0, y,
                    0, 0, 1, z || 0,
                    0, 0, 0, 1]);
};

})();
