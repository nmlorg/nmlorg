(function() {

/** @namespace */
var nmlorg = window.nmlorg = window.nmlorg || {};


/**
 * @constructor
 */
nmlorg.CanvasGrid = function() {
  var canvas = this.canvas_ = document.createElement('canvas');
  var ctx = this.ctx_ = canvas.getContext('2d');

  this.cellWidth = this.cellHeight = 32;
  this.width = this.height = 20;
  canvas.width = this.width * this.cellWidth;
  canvas.height = this.height * this.cellHeight;
  this.cells_ = {};
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

  ctx.fillStyle = 'rgba(0, 0, 0, .2)';
  for (var i = 0; i < this.width; i++) {
    var x = i * this.cellWidth;

    for (var j = 0; j < this.height; j++) {
      var y = j * this.cellHeight;

      if (this.bg_)
        this.bg_.draw(ctx, x, y, this.cellWidth, this.cellHeight);
      if ((i + j) % 2)
        ctx.fillRect(x, y, this.cellWidth, this.cellHeight);
      var tiles = this.cells_[j * this.width + i];
      if (tiles)
        for (var tile of tiles)
          tile.draw(ctx, x, y, this.cellWidth, this.cellHeight);
    }
  }
};


nmlorg.CanvasGrid.prototype.setBackground = function(tile) {
  this.bg_ = tile;
};


nmlorg.CanvasGrid.prototype.setForeground = function(x, y, tile) {
  var offset = y * this.width + x;

  this.cells_[offset] = [...arguments].slice(2);
};

})();
