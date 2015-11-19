(function() {

/** @namespace */
spacex = window.spacex || {};


/**
 * A model of the vehicle's compass heading.
 * @constructor
 */
spacex.Compass = function() {
  this.canvas_ = document.createElement('canvas');
  this.canvas_.className = 'compass';
  this.canvas_.width = this.canvas_.height = this.dim_;
  this.ctx_ = this.canvas_.getContext('2d');
};


spacex.Compass.prototype.dim_ = 1000;


/**
 * Add the model's viewport to the document.
 * @param {HTMLElement} parent An element reachable via document.body.
 */
spacex.Compass.prototype.attach = function(parent, x, y) {
  parent.appendChild(this.canvas_);
  this.canvas_.style.left = (x || 0) + 'vw';
  this.canvas_.style.top = (y || 0) + 'vw';
  return this;
};


/**
 * Draw the model to its viewport based on the given yaw, pitch, and roll. When facing due North,
 * yaw will be 0. Pitch and roll are not used.
 * @param {number} yaw The yaw or compass heading in degrees.
 * @param {number} pitch The pitch or climbing angle in degrees.
 * @param {number} roll The roll or banking angle in degrees.
 */
spacex.Compass.prototype.drawFromYPR = function(yaw, pitch, roll) {
  var ctx = this.ctx_;

  ctx.clearRect(0, 0, this.dim_, this.dim_);
  ctx.save();
    // Move the origin to the center of the viewport.
    ctx.translate(this.dim_ / 2, this.dim_ / 2);
    // Rotate the viewport about the origin (now the center).
    ctx.rotate(-yaw * Math.PI / 180);
    // Move the origin back to the upper-left corner.
    ctx.translate(-this.dim_ / 2, -this.dim_ / 2);
    // Draw NW.
    ctx.fillStyle = 'rgba(0, 255, 128, .5)';
    ctx.fillRect(0, 0, this.dim_ / 2, this.dim_ / 2);
    // Draw NE.
    ctx.fillStyle = 'rgba(0, 128, 255, .5)';
    ctx.fillRect(this.dim_ / 2, 0, this.dim_ / 2, this.dim_ / 2);
    // Draw SW.
    ctx.fillStyle = 'rgba(255, 128, 0, .5)';
    ctx.fillRect(0, this.dim_ / 2, this.dim_ / 2, this.dim_ / 2);
    // Draw SE.
    ctx.fillStyle = 'rgba(255, 0, 128, .5)';
    ctx.fillRect(this.dim_ / 2, this.dim_ / 2, this.dim_ / 2, this.dim_ / 2);
    // Draw labels.
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.font = '10vw monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', this.dim_ / 2 - 35, 35 + 15);
    ctx.fillText('S', this.dim_ / 2 - 35, this.dim_ - 50 - 15);
    ctx.fillText('E', this.dim_ - 50 - 35, this.dim_ / 2);
    ctx.fillText('W', 15, this.dim_ / 2);
  ctx.restore();
  ctx.save();
    // Draw the ship.
    ctx.fillStyle = 'rgba(255, 0, 0, .5)';
    ctx.fillRect(this.dim_ / 4, 7 * this.dim_ / 16, 3 * this.dim_ / 16, this.dim_ / 8);
    ctx.fillStyle = 'rgba(0, 255, 0, .5)';
    ctx.fillRect(9 * this.dim_ / 16, 7 * this.dim_ / 16, 3 * this.dim_ / 16, this.dim_ / 8);
    var vehicleLength = 3 * this.dim_ / 4;
    ctx.fillStyle = 'rgba(0, 0, 0, .5)';
    ctx.fillRect(7 * this.dim_ / 16, this.dim_ / 8, this.dim_ / 8, vehicleLength);
    var vehicleShrink = 1 - Math.cos(Math.abs(pitch) * Math.PI / 180);
    ctx.fillStyle = 'rgba(255, 255, 255, .5)';
    ctx.fillRect(7 * this.dim_ / 16,
                 this.dim_ / 8 + vehicleShrink * vehicleLength / 2,
                 this.dim_ / 8, 
                 (1 - vehicleShrink) * vehicleLength);
  ctx.restore();

  return this;
};

})();
