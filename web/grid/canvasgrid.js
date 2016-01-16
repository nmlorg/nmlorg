(function() {

/** @namespace */
var nmlorg = window.nmlorg = window.nmlorg || {};


/**
 * @constructor
 */
nmlorg.CanvasGrid = function() {
  var canvas = this.canvas_ = document.createElement('canvas');
  var ctx = this.ctx_ = canvas.getContext('2d');

  canvas.width = canvas.height = 1000;
};


/**
 * Add the grid's viewport to the document.
 * @param {HTMLElement} parent An element reachable at or from document.body.
 */
nmlorg.CanvasGrid.prototype.attach = function(parent) {
  parent.appendChild(this.canvas_);
  this.canvas_.focus();
  return this;
};


/**
 * Draw the canvas.
 */
nmlorg.CanvasGrid.prototype.draw = function() {
  var ctx = this.ctx_;

  for (var i = 0; i < 5; i++) {
    for (var j = 0; j < 5; j++) {
      ctx.drawImage(img, 0, 0, 32, 32, i * 100, j * 100, 100, 100);
    }
  }
};

})();
