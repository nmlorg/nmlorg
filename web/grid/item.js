(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


/**
 * @constructor
 * @param {nmlorg.Tile} tile The tile to show for this item.
 */
nmlorg.Item = function(tile, opts) {
  this.tile = tile;
  for (var k in opts)
    this[k] = opts[k];
};

})();
