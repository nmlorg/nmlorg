(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


/**
 * @constructor
 * @param {HTMLImageElement} img An <img> or new Image() containing the tile.
 * @param {number} [x=0] The x coordinate of the upper-left corner of the tile within the image.
 * @param {number} [y=0] The y coordinate of the upper-left corner of the tile within the image.
 * @param {number} [width] The width of the tile.
 * @param {number} [height] The height of the tile.
 */
nmlorg.Tile = function(img, x, y, width, height) {
  this.img_ = img;
  this.x_ = x || 0;
  this.y_ = y || 0;
  this.w_ = width || (img.naturalWidth - this.x_);
  this.h_ = height || (img.naturalHeight - this.y_);
};
nmlorg['Tile'] = nmlorg.Tile;


nmlorg.Tile.prototype.addEventListener = function() {
  return this.img_.addEventListener(...arguments);
};


Object.defineProperty(nmlorg.Tile.prototype, 'complete', {
    'get': function() {
      return this.img_.complete;
    },
});


/**
 * Draw the tile on the given canvas context, optionally resizing it.
 * @param {CanvasRenderingContext2D} ctx The canvas context (canvas.getContext('2d')).
 * @param {number} x The x coordinate.
 * @param {number} y The y coordinate.
 * @param {number=} w The width of the area in which to draw the tile.
 * @param {number=} h The height of the area in which to draw the tile.
 */
nmlorg.Tile.prototype.draw = function(ctx, x, y, w, h) {
  var w1 = this.w_ * h / this.h_;

  if (w1 <= w) {
    x += (w - w1) / 2;
    w = w1;
  } else {
    var h1 = this.h_ * w / this.w_;
    y += (h - h1) / 2;
    h = h1;
  }

  ctx.drawImage(this.img_, this.x_, this.y_, this.w_, this.h_, Math.round(x), Math.round(y),
                Math.round(w || this.w_), Math.round(h || this.h_));
};
nmlorg.Tile.prototype['draw'] = nmlorg.Tile.prototype.draw;

})();
