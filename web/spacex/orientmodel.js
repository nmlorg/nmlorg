(function() {

/** @namespace */
spacex = window.spacex || {};


/**
 * A model of the vehicle's orientation (deviating from Earth center).
 * @param {spacex.Vehicle} vehicle The vehicle to render.
 * @constructor
 */
spacex.OrientModel = function(vehicle) {
  this.vehicle_ = vehicle;
  this.canvas_ = document.createElement('canvas');
  this.canvas_.className = 'orientmodel';
  this.canvas_.width = this.canvas_.height = this.dim_;
  this.ctx_ = this.canvas_.getContext('2d');
};


spacex.OrientModel.prototype.dim_ = 1000;
spacex.OrientModel.prototype.y_ = 0;


/**
 * Add the model's viewport to the document.
 * @param {HTMLElement} parent An element reachable via document.body.
 */
spacex.OrientModel.prototype.attach = function(parent, x, y) {
  parent.appendChild(this.canvas_);
  this.canvas_.style.left = (x || 0) + 'vw';
  this.canvas_.style.top = (y || 0) + 'vw';
  return this;
};


/**
 * Draw the model to its viewport based on the given yaw, pitch, and roll. When level, pitch and
 * roll will be 0. Yaw (compass heading) is not used.
 * @param {number} dt The amount of time to advance, in seconds.
 */
spacex.OrientModel.prototype.draw = function(dt) {
  var ctx = this.ctx_;

  this.y_ = (this.y_ + this.vehicle_.velocity * dt) % (this.dim_ / 10);

  ctx.clearRect(0, 0, this.dim_, this.dim_);
  ctx.save();
    // Move the origin to the center of the viewport.
    ctx.translate(this.dim_ / 2, this.dim_ / 2);
    // Rotate the viewport about the origin (now the center).
    ctx.rotate(-this.vehicle_.roll * Math.PI / 180);
    // Move the origin back to the upper-left corner.
    ctx.translate(-this.dim_ / 2, -this.dim_ / 2);
    // Draw the sky.
    ctx.fillStyle = 'rgba(0, 0, 128, .5)';
    ctx.fillRect(0, 0, this.dim_, this.dim_ / 2);
    // Draw the ground.
    ctx.fillStyle = 'rgba(165, 42, 42, .5)';
    ctx.fillRect(0, this.dim_ / 2, this.dim_, this.dim_ / 2);
    // Draw some surface features to clearly indicate direction of motion.
    ctx.strokeStyle = 'rgba(42, 165, 42, .5)';
    for (var i = 0; i < 10; i++)
      for (var j = -1; j < 5; j++) {
        var y = this.y_ + j * this.dim_ / 10;
        var height = this.dim_ / 10;

        if (y < 0) {
          height += y;
          y = 0;
        }
        ctx.strokeRect(i * this.dim_ / 10, this.dim_ / 2 + y, this.dim_ / 10, height);
      }
  ctx.restore();
  ctx.save();
    // Draw the ship. We draw a red rectangle for the front of the ship, then a white rectangle for
    // the back. The further the pitch is from 0, the more of the red will be shown.
    var pitchHeight = this.dim_ / 2 * Math.sin(this.vehicle_.pitch * Math.PI / 180);
    ctx.fillStyle = 'rgba(255, 0, 0, .5)';
    ctx.fillRect(this.dim_ / 4, 7 * this.dim_ / 16, 3 * this.dim_ / 16, this.dim_ / 8);
    ctx.fillStyle = 'rgba(0, 255, 0, .5)';
    ctx.fillRect(9 * this.dim_ / 16, 7 * this.dim_ / 16, 3 * this.dim_ / 16, this.dim_ / 8);
    ctx.fillStyle = 'rgba(255, 255, 255, .5)';
    ctx.fillRect(7 * this.dim_ / 16, 7 * this.dim_ / 16 - pitchHeight, this.dim_ / 8, this.dim_ / 8);
    ctx.fillStyle = 'rgba(255, 255, 255, .1)';
    ctx.fillRect(7 * this.dim_ / 16, 7 * this.dim_ / 16 - pitchHeight, this.dim_ / 8, pitchHeight * 2);
    ctx.fillRect(7 * this.dim_ / 16, 7 * this.dim_ / 16 - pitchHeight + this.dim_ / 8, this.dim_ / 8, pitchHeight * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, .5)';
    ctx.fillRect(7 * this.dim_ / 16, 7 * this.dim_ / 16 + pitchHeight, this.dim_ / 8, this.dim_ / 8);
  ctx.restore();

  return this;
};

})();
