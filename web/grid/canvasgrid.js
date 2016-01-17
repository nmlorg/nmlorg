(function() {

/** @namespace */
var nmlorg = window.nmlorg = window.nmlorg || {};


/**
 * @constructor
 */
nmlorg.CanvasGrid = function(width, height) {
  var body = this.body_ = document.createElement('div');
  body.className = 'canvas';
  this.cellWidth = this.cellHeight = 32;
  this.width = width;
  this.height = height;
  this.bgCanvas_ = this.makeCanvas();
  this.bgCtx_ = this.bgCanvas_.getContext('2d');
  this.gridCanvas_ = this.makeCanvas();
  this.gridCanvas_.className = 'while-editing';
  this.gridCtx_ = this.gridCanvas_.getContext('2d');
  this.setGrid();
  this.fgCanvas_ = this.makeCanvas();
  this.fgCtx_ = this.fgCanvas_.getContext('2d');
  this.uiCanvas_ = this.makeCanvas();
  this.uiCtx_ = this.uiCanvas_.getContext('2d');
  this.cells_ = {};

  var lastCol = -1, lastRow = -1;

  var onMouseMove = function(grid, e) {
    var x = e.offsetX, y = e.offsetY;
    var rect = e.target.getBoundingClientRect();
    var col = Math.floor(grid.width * x / rect.width);
    var row = Math.floor(grid.height * y / rect.height);
    if ((col != lastCol) || (row != lastRow)) {
      var cell = grid.getForeground(lastCol, lastRow);
      if (cell && cell.length)
        grid.addForeground(col, row, cell.pop());
      lastCol = col;
      lastRow = row;
      grid.draw();
    }
  }.bind(body, this);

  body.addEventListener('mousedown', function(e) {
    this.classList.add('editing');
    lastCol = lastRow = -1;
    this.addEventListener('mousemove', onMouseMove);
  });

  body.addEventListener('mouseup', function(e) {
    this.removeEventListener('mousemove', onMouseMove);
    this.classList.remove('editing');
  });
};


nmlorg.CanvasGrid.prototype.addForeground = function(col, row, tile) {
  var offset = row * this.width + col;

  if (!this.cells_[offset])
    this.cells_[offset] = [];
  this.cells_[offset].push(...[...arguments].slice(2));
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

  ctx.clearRect(0, 0, this.fgCanvas_.width, this.fgCanvas_.height);
  for (var col = 0; col < this.width; col++) {
    for (var row = 0; row < this.height; row++) {
      var tiles = this.getForeground(col, row);
      if (tiles)
        for (var tile of tiles)
          tile.draw(ctx, col * this.cellWidth, row * this.cellHeight, this.cellWidth,
                    this.cellHeight);
    }
  }
};


nmlorg.CanvasGrid.prototype.getForeground = function(col, row) {
  var offset = row * this.width + col;

  return this.cells_[offset];
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

  for (var col = 0; col < this.width; col++)
    for (var row = 0; row < this.height; row++)
      tile.draw(ctx, col * this.cellWidth, row * this.cellHeight, this.cellWidth, this.cellHeight);
};


nmlorg.CanvasGrid.prototype.setGrid = function() {
  var ctx = this.gridCtx_;

  for (var col = 0; col < this.width; col++) {
    for (var row = 0; row < this.height; row++) {
      if ((col + row) % 2)
        ctx.fillStyle = 'rgba(0, 0, 0, .1)';
      else
        ctx.fillStyle = 'rgba(255, 255, 255, .1)';
      ctx.fillRect(col * this.cellWidth, row * this.cellHeight, this.cellWidth, this.cellHeight);
    }
  }
};


nmlorg.CanvasGrid.prototype.setForeground = function(col, row, tile) {
  var offset = row * this.width + col;

  this.cells_[offset] = [...arguments].slice(2);
};

})();
