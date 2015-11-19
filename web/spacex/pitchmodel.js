(function() {

/** @namespace */
spacex = window.spacex || {};


/**
 * A model of the vehicle's pitch/angle of attack.
 * @constructor
 */
spacex.PitchModel = function() {
  this.canvas_ = document.createElement('canvas');
  this.canvas_.className = 'pitchmodel';
  this.canvas_.width = this.canvas_.height = this.dim_;
  this.ctx_ = this.canvas_.getContext('2d');
};


spacex.PitchModel.prototype.dim_ = 1000;


/**
 * Add the model's viewport to the document.
 * @param {HTMLElement} parent An element reachable via document.body.
 */
spacex.PitchModel.prototype.attach = function(parent, x, y) {
  parent.appendChild(this.canvas_);
  this.canvas_.style.left = (x || 0) + 'vw';
  this.canvas_.style.top = (y || 0) + 'vw';
  return this;
};


/**
 * Draw the model to its viewport based on the given yaw, pitch, and roll. When level, pitch and
 * roll will be 0. Yaw (compass heading) is not used.
 * @param {number} yaw The yaw or compass heading in degrees.
 * @param {number} pitch The pitch or climbing angle in degrees.
 * @param {number} roll The roll or banking angle in degrees.
 */
spacex.PitchModel.prototype.drawFromYPR = function(yaw, pitch, roll) {
  var ctx = this.ctx_;

  ctx.clearRect(0, 0, this.dim_, this.dim_);
  ctx.save();
    // Move the origin to the center of the viewport.
    ctx.translate(this.dim_ / 2, this.dim_ / 2);
    // Rotate the viewport about the origin (now the center).
    ctx.rotate(-pitch * Math.PI / 180);
    // Move the origin back to the upper-left corner.
    ctx.translate(-this.dim_ / 2, -this.dim_ / 2);
    // Draw the sky.
    ctx.fillStyle = 'rgba(0, 0, 128, .5)';
    ctx.fillRect(0, 0, this.dim_, this.dim_ / 2);
    // Draw the ground.
    ctx.fillStyle = 'rgba(165, 42, 42, .5)';
    ctx.fillRect(0, this.dim_ / 2, this.dim_, this.dim_ / 2);
  ctx.restore();
  ctx.save();
    // Draw the ship.
    var rollHeight = this.dim_ / 2 * Math.sin(roll * Math.PI / 180);
    ctx.fillStyle = 'rgba(0, 255, 0, .5)';
    ctx.fillRect(this.dim_ / 3, 7 * this.dim_ / 16 + rollHeight, this.dim_ / 3, this.dim_ / 8);
    ctx.fillStyle = 'rgba(255, 255, 255, .5)';
    ctx.fillRect(this.dim_ / 8, 7 * this.dim_ / 16, 3 * this.dim_ / 4, this.dim_ / 8);
    ctx.fillStyle = 'rgba(255, 0, 0, .5)';
    ctx.fillRect(this.dim_ / 4, 7 * this.dim_ / 16 - rollHeight, this.dim_ / 2, this.dim_ / 8);
  ctx.restore();

  return this;
};

})();
