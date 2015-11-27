(function() {

/** @namespace */
spacex = window.spacex || {};


spacex.Camera = function() {
  this.stack_ = [];
  this.push();
};


spacex.Camera.prototype.getM_ = function() {
  return this.stack_[this.stack_.length - 1];
};


spacex.Camera.prototype.multiply = function(rhs) {
  return this.getM_().multiply(rhs);
};


spacex.Camera.prototype.multiplySet = function(rhs) {
  this.stack_[this.stack_.length - 1] = this.multiply(rhs);
};


spacex.Camera.prototype.pop = function() {
  this.stack_.pop();
  if (!this.stack_.length)
    this.push();
};


spacex.Camera.prototype.push = function() {
  this.stack_.push(this.stack_.length ? this.getM_().copy() : spacex.Matrix.identity(4, 4));
};


spacex.Camera.prototype.rotateX = function(angle) {
  var a = angle * Math.PI / 180;
  var ca = Math.cos(a), sa = Math.sin(a);

  this.multiplySet([1, 0, 0, 0,
                    0, ca, -sa, 0,
                    0, sa, ca, 0,
                    0, 0, 0, 1]);
};


spacex.Camera.prototype.rotateY = function(angle) {
  var a = angle * Math.PI / 180;
  var ca = Math.cos(a), sa = Math.sin(a);

  this.multiplySet([ca, 0, sa, 0,
                    0, 1, 0, 0,
                    -sa, 0, ca, 0,
                    0, 0, 0, 1]);
};


spacex.Camera.prototype.rotateZ = function(angle) {
  var a = angle * Math.PI / 180;
  var ca = Math.cos(a), sa = Math.sin(a);

  this.multiplySet([ca, -sa, 0, 0,
                    sa, ca, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1]);
};

})();
