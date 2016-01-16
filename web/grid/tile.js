(function() {

/** @namespace */
var nmlorg = window.nmlorg = window.nmlorg || {};


/**
 * @constructor
 */
nmlorg.Tile = function(img, x, y, width, height) {
  this.img_ = img;
  this.x_ = x;
  this.y_ = y;
  this.w_ = width;
  this.h_ = height;
};


nmlorg.Tile.prototype.draw = function(ctx, x, y, w, h) {
  ctx.drawImage(this.img_, this.x_, this.y_, this.w_, this.h_, x, y, w || this.w_, h || this.h_);
};

})();
