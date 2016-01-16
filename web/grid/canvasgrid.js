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
  this.width = this.height = 10;
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

  for (var x = 0; x < this.width; x++) {
    for (var y = 0; y < this.height; y++) {
      if (this.bg_)
        this.bg_.draw(ctx, x * this.cellWidth, y * this.cellHeight, this.cellWidth,
                      this.cellHeight);
      var tiles = this.cells_[y * this.width + x];
      if (tiles)
        for (var tile of tiles)
          tile.draw(ctx, x * this.cellWidth, y * this.cellHeight, this.cellWidth, this.cellHeight);
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
