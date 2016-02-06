(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


/**
 * @constructor
 * @param {HTMLImageElement} img An <img> or new Image() containing the tile.
 * @param {number} [width] The width of each tile.
 * @param {number} [height] The height of each tile.
 */
nmlorg.Sheet = function(img, width, height) {
  this.img_ = img;
  this.w_ = width || (img.naturalWidth - this.x_);
  this.h_ = height || (img.naturalHeight - this.y_);
};
nmlorg['Sheet'] = nmlorg.Sheet;


/**
 * Return an nmlorg.Tile for the given position.
 * @param {number} x The x coordinate (in tiles).
 * @param {number} y The y coordinate (in tiles).
 */
nmlorg.Sheet.prototype.getTile = function(x, y) {
  return new nmlorg.Tile(this.img_, x * this.w_, y * this.h_, this.w_, this.h_);
};
nmlorg.Sheet.prototype['getTile'] = nmlorg.Sheet.prototype.getTile;

})();
