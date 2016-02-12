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
 * Add one or more items to the given cell.
 * @param {number} col The column (in cells).
 * @param {number} row The row (in cells).
 * @param {...nmlorg.Item} item The item or items to add.
 */
nmlorg.Layer.prototype.addForeground = function(col, row, item) {
  var offset = row * this.grid_.width + col;

  var cell = this.cells_[offset];
  if (!cell)
    cell = this.cells_[offset] = [];
  for (var i = 2; i < arguments.length; i++) {
    item = arguments[i];
    cell.push(item);
    this.watchNewTile(item.tile);
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
  var grid = this.grid_, ctx = this.ctx_;
  var bgTile = (this.bgTile_ && this.bgTile_.complete) ? this.bgTile_ : null;
  var now = Date.now();

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (var col = 0; col < grid.width; col++) {
    for (var row = 0; row < grid.height; row++) {
      if (bgTile)
        bgTile.draw(ctx, col * grid.cellWidth, row * grid.cellHeight, grid.cellWidth,
                    grid.cellHeight);
      var items = this.getForeground(col, row);
      if (items && items.length) {
        for (var i = 1; i < items.length; i++)
          if (items[i] !== items[0])
            break;
        if ((i > 1) && (i == items.length)) {
          items[0].tile.draw(
              ctx, col * grid.cellWidth, row * grid.cellHeight, grid.cellWidth, grid.cellHeight);
          ctx.fillText(i, col * grid.cellWidth, (row + 1) * grid.cellHeight);
        } else {
          var subCells = items.length + 3;
          for (var i = 0; i < items.length; i++) {
            var tile = items[i].tile;
            tile.draw(
                ctx, (col + i / subCells) * grid.cellWidth, (row + i / subCells) * grid.cellHeight,
                grid.cellWidth * 4 / subCells, grid.cellHeight * 4 / subCells);
            if (tile.animRate) {
              var nextAnim = now + tile.animRate - (now % tile.animRate);
              if ((this.nextAnim_ < now) || (nextAnim < this.nextAnim_))
                this.nextAnim_ = nextAnim;
            }
          }
        }
      }
    }
  }
};


/**
 * Get the given foreground cell's item stack.
 * @param {number} col The column (in cells).
 * @param {number} row The row (in cells).
 * @returns {?Array.<nmlorg.Item>}
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
