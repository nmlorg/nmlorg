(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


/**
 * @constructor
 */
nmlorg.Layer = function(grid) {
  this.grid_ = grid;
  this.ctx_ = grid.makeCanvasContext();
  this.dirty_ = false;
  this.nextAnim_ = 0;
  this.cells_ = {};
  this.imageLoaded_ = function() {
    this.dirty_ = true;
  }.bind(this);
};


/**
 * Add one or more tiles to the given cell.
 * @param {number} col The column (in cells).
 * @param {number} row The row (in cells).
 * @param {...nmlorg.Tile} tile The tile or tiles to add.
 */
nmlorg.Layer.prototype.addForeground = function(col, row, tile) {
  var offset = row * this.grid_.width + col;

  var cell = this.cells_[offset];
  if (!cell)
    cell = this.cells_[offset] = [];
  for (var i = 2; i < arguments.length; i++) {
    tile = arguments[i];
    cell.push(tile);
    this.watchNewTile(tile);
  }
};


/**
 * Redraw any dirty canvases.
 */
nmlorg.Layer.prototype.draw = function() {
  if (this.dirty_ || (this.nextAnim_ && (this.nextAnim_ <= Date.now()))) {
    this.dirty_ = false;
    this.nextAnim_ = 0;
    this.draw_();
  }
};



/**
 * Redraw the foreground canvas.
 */
nmlorg.Layer.prototype.draw_ = function() {
  console.log('Drawing layer.');
  var ctx = this.ctx_;
  var bgTile = (this.bgTile_ && this.bgTile_.complete) ? this.bgTile_ : null;
  var now = Date.now();

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (var col = 0; col < this.grid_.width; col++) {
    for (var row = 0; row < this.grid_.height; row++) {
      if (bgTile)
        bgTile.draw(ctx, col * this.grid_.cellWidth, row * this.grid_.cellHeight,
                    this.grid_.cellWidth, this.grid_.cellHeight);
      var tiles = this.getForeground(col, row);
      if (tiles) {
        var subCells = tiles.length + 3;
        for (var i = 0; i < tiles.length; i++) {
          var tile = tiles[i];
          tile.draw(
              ctx, (col + i / subCells) * this.grid_.cellWidth,
              (row + i / subCells) * this.grid_.cellHeight, this.grid_.cellWidth * 4 / subCells,
              this.grid_.cellHeight * 4 / subCells);
          if (tile.animRate) {
            var nextAnim = now + tile.animRate - (now % tile.animRate);
            if ((this.nextAnim_ < now) || (nextAnim < this.nextAnim_))
              this.nextAnim_ = nextAnim;
          }
        }
      }
    }
  }
};


/**
 * Get the given foreground cell's tile stack.
 * @param {number} col The column (in cells).
 * @param {number} row The row (in cells).
 * @returns {?Array.<nmlorg.Tile>}
 */
nmlorg.Layer.prototype.getForeground = function(col, row) {
  var offset = row * this.grid_.width + col;

  return this.cells_[offset];
};


/**
 * Redraw the background layer with the given tile in all cells.
 * @param {nmlorg.Tile} tile The tile to draw.
 */
nmlorg.Layer.prototype.setBackground = function(tile) {
  this.bgTile_ = tile;
  this.watchNewTile(tile);
};


/**
 * Redraw the layer as an editing grid.
 */
nmlorg.Layer.prototype.setGrid = function() {
  var ctx = this.ctx_;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (var col = 0; col < this.grid_.width; col++) {
    for (var row = 0; row < this.grid_.height; row++) {
      if ((col + row) % 2)
        ctx.fillStyle = 'rgba(0, 0, 0, .1)';
      else
        ctx.fillStyle = 'rgba(255, 255, 255, .1)';
      ctx.fillRect(col * this.grid_.cellWidth, row * this.grid_.cellHeight, this.grid_.cellWidth,
                   this.grid_.cellHeight);
    }
  }
};


/**
 * Replace the given foreground cell with zero or more tiles.
 * @param {number} col The column (in cells).
 * @param {number} row The row (in cells).
 * @param {...nmlorg.Tile} tile The tile or tiles to add.
 */
nmlorg.Layer.prototype.setForeground = function(col, row, tile) {
  var offset = row * this.grid_.width + col;

  this.cells_[offset] = [];
  this.addForeground(...arguments);
};


/**
 * Mark the layer as dirty (needing to be redrawn) immediately if the given tile is loaded, or
 * asynchronously as soon as the tile loads.
 * @param {nmlorg.Tile} tile The tile to watch.
 */
nmlorg.Layer.prototype.watchNewTile = function(tile) {
  if (tile.complete)
    this.dirty_ = true;
  else
    tile.addEventListener('load', this.imageLoaded_);
};

})();
