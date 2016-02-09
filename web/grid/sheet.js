(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


/**
 * @constructor
 * @param {HTMLImageElement|string} img An <img> or new Image() containing the tile.
 * @param {number} width The width of each tile.
 * @param {number} height The height of each tile.
 */
nmlorg.Sheet = function(img, width, height) {
  if ((img instanceof String) || (typeof img == 'string')) {
    this.img_ = document.createElement('img');
    this.img_.src = img;
  } else
    this.img_ = img;
  this.w_ = width;
  this.h_ = height;
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
