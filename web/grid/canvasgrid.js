(function() {

/** @namespace */
var nmlorg = window.nmlorg = window.nmlorg || {};


/**
 * @constructor
 */
nmlorg.CanvasGrid = function(width, height) {
  this.body_ = document.createElement('div');
  this.body_.className = 'canvas';
  this.cellWidth = this.cellHeight = 32;
  this.width = width;
  this.height = height;
  this.bgCanvas_ = this.makeCanvas();
  this.bgCtx_ = this.bgCanvas_.getContext('2d');
  this.gridCanvas_ = this.makeCanvas();
  this.gridCanvas_.className = 'on-hover';
  this.gridCtx_ = this.gridCanvas_.getContext('2d');
  this.setGrid();
  this.fgCanvas_ = this.makeCanvas();
  this.fgCtx_ = this.fgCanvas_.getContext('2d');
  this.uiCanvas_ = this.makeCanvas();
  this.uiCtx_ = this.uiCanvas_.getContext('2d');
  this.cells_ = {};
};


/**
 * Add the grid's viewport to the document.
 * @param {HTMLElement} parent An element reachable at or from document.body.
 */
nmlorg.CanvasGrid.prototype.attach = function(parent) {
  parent.appendChild(this.body_);
  this.body_.focus();
  return this;
};


/**
 * Draw the canvas.
 */
nmlorg.CanvasGrid.prototype.draw = function() {
  var ctx = this.fgCtx_;

  for (var i = 0; i < this.width; i++) {
    for (var j = 0; j < this.height; j++) {
      var tiles = this.cells_[j * this.width + i];
      if (tiles)
        for (var tile of tiles)
          tile.draw(ctx, i * this.cellWidth, j * this.cellHeight, this.cellWidth, this.cellHeight);
    }
  }
};


/**
 * Create a canvas and add it to the rendering stack.
 */
nmlorg.CanvasGrid.prototype.makeCanvas = function() {
  var canvas = document.createElement('canvas');
  this.body_.appendChild(canvas);
  canvas.width = this.width * this.cellWidth;
  canvas.height = this.height * this.cellHeight;
  return canvas;
};


nmlorg.CanvasGrid.prototype.setBackground = function(tile) {
  var ctx = this.bgCtx_;

  for (var i = 0; i < this.width; i++)
    for (var j = 0; j < this.height; j++)
      tile.draw(ctx, i * this.cellWidth, j * this.cellHeight, this.cellWidth, this.cellHeight);
};


nmlorg.CanvasGrid.prototype.setGrid = function() {
  var ctx = this.gridCtx_;

  for (var i = 0; i < this.width; i++) {
    for (var j = 0; j < this.height; j++) {
      if ((i + j) % 2)
        ctx.fillStyle = 'rgba(0, 0, 0, .1)';
      else
        ctx.fillStyle = 'rgba(255, 255, 255, .1)';
      ctx.fillRect(i * this.cellWidth, j * this.cellHeight, this.cellWidth, this.cellHeight);
    }
  }
};


nmlorg.CanvasGrid.prototype.setForeground = function(x, y, tile) {
  var offset = y * this.width + x;

  this.cells_[offset] = [...arguments].slice(2);
};

})();
