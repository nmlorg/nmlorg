/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg = window.nmlorg || {};


/** @namespace */
nmlorg.game.camera = nmlorg.game.camera || {};


nmlorg.game.camera.Camera = function(canvas, x, y, z) {
  this.canvas = canvas;
  this.x = x;
  this.y = y;
  this.z = z;
  this.dx = -x;
  this.dy = -y;
  this.dz = -z;
};


nmlorg.game.camera.Camera.prototype.getScreenCoords = function(x, y, z) {
  this.canvas.setCamera(this.x, this.y, this.z,
                        this.x + this.dx, this.y + this.dy, this.z + this.dz,
                        0, 0, 1);
  return this.canvas.getScreenCoords(x, y, z);
};


nmlorg.game.camera.Camera.prototype.contain = function(x, y, z, left, right, top, bottom) {
  var screen = this.getScreenCoords(x, y, z);

  while (screen[2] > .85) {
    this.y += .02;
    screen = this.getScreenCoords(x, y, z);
  }

  while (screen[2] < .72) {
    this.y -= .02;
    screen = this.getScreenCoords(x, y, z);
  }

  while (screen[0] < left) {
    this.x -= .02;
    screen = this.getScreenCoords(x, y, z);
  }

  while (screen[0] > right) {
    this.x += .02;
    screen = this.getScreenCoords(x, y, z);
  }

  while (screen[1] < top) {
    this.z -= .02;
    screen = this.getScreenCoords(x, y, z);
  }

  while (screen[1] > bottom) {
    this.z += .02;
    screen = this.getScreenCoords(x, y, z);
  }
};


})();
