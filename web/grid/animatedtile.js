(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


/**
 * @constructor
 * @param {number} animRate The number of ms between animations.
 * @param {...nmlorg.Tile} tile Two or more tiles to animate between.
 */
nmlorg.AnimatedTile = function(animRate, tile) {
  this.animRate = animRate;
  this.tiles_ = [...arguments].slice(1);
  this.imgs_ = new Set();
  for (tile of this.tiles_)
    this.imgs_.add(tile.img_);
};


nmlorg.AnimatedTile.prototype.addEventListener = function(type, listener) {
  var count = 0;

  var interim = function(e) {
    if (++count == this.imgs_.size)
      listener(e);
  }.bind(this);

  for (var img of this.imgs_)
    img.addEventListener(type, interim);
};


Object.defineProperty(nmlorg.AnimatedTile.prototype, 'complete', {
    'get': function() {
      for (var tile of this.tiles_)
        if (!tile.img_.complete)
          return false;
      return true;
    },
});


/**
 * Choose the current tile to draw and draw it to the given canvas context.
 * @param {CanvasRenderingContext2D} ctx The canvas context (canvas.getContext('2d')).
 * @param {number} x The x coordinate.
 * @param {number} y The y coordinate.
 * @param {number=} w The width of the area in which to draw the tile.
 * @param {number=} h The height of the area in which to draw the tile.
 */
nmlorg.AnimatedTile.prototype.draw = function(ctx, x, y, w, h) {
  var period = this.animRate * this.tiles_.length;
  var slice = Math.floor((Date.now() % period) / this.animRate);
  return this.tiles_[slice].draw(ctx, x, y, w, h);
};

})();
