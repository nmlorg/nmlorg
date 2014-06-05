/**
 * @fileoverview Routines to describe the geometry and coloring of arbitrary shapes in 3D space.
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
nmlorg.threed.shape = nmlorg.threed.shape || {};


var VALUE_TYPES = {
    'color': 4,
    'position': 3,
    'texture': 2,
};


/**
 * All of the geometry, color, and texture information needed to render a shape. Each Shape is added to 
 * a {@link nmlorg.world.World} via {@link nmlorg.world.World#addObject} to produce a 
 * {@link nmlorg.world.PositionObject}.
 * @constructor
 * @param {Array.<string|nmlorg.threed.shape.Image>} valueTypes The list of buffer types or backing images for 
 *     each vertex.
 * @param {string} vertexType All shapes are rendered as triangles. When vertexType is "triangles", each 
 *     triplet of vertices in combinedVertices represents an independent triangle, as [cV[0], cV[1], 
 *     cV[2]], [cV[3], cV[4], cV[5]], etc.  When vertexType is "triangle strip", triangles are 
 *     constructed from [cV[0], cv[1], cv[2]], [cV[1], cV[2], cV[3]], etc.
 * @param {Array.<number>} combinedVertices The set of all vertices, flattened so all points for all 
 *     buffers for the first vertex are first, followed by all points for all buffers for the second 
 *     vertex, etc.
 */
nmlorg.threed.shape.Shape = function(valueTypes, vertexType, combinedVertices) {
  var vertexGroups = {};
  var newValueTypes = [];

  for (var i = 0; i < valueTypes.length; i++) {
    var valueType = valueTypes[i];

    if (valueType instanceof nmlorg.threed.shape.Image) {
      this.textureImage = valueType;
      valueType = 'texture';
    }

    newValueTypes.push(valueType);
    vertexGroups[valueType] = [];
  }
  valueTypes = newValueTypes;

  var i = 0;
  var numVertices = 0;

  while (i < combinedVertices.length) {
    numVertices++;
    for (var j = 0; j < valueTypes.length; j++) {
      var valueType = valueTypes[j];
      var sliceLength = VALUE_TYPES[valueType];

      for (var k = i; k < i + sliceLength; k++)
        vertexGroups[valueType].push(combinedVertices[k]);
      i += sliceLength;
    }
  }

  vertexType = vertexType.toUpperCase().replace(/ /g, '_');
  if (vertexType == 'TRIANGLES') {
    if (numVertices % 3 != 0)
      throw 'The vertex list is a set of triangles, so the vertices must come in groups of 3.';
  } else if (vertexType == 'TRIANGLE_STRIP') {
  } else
    throw 'Unknown vertex type (' + vertexType + ').';

  this.vertexGroups = vertexGroups;
  this.vertexType = vertexType;
  this.numVertices = numVertices;
  Object.freeze(this);
};


/**
 * Raise val to the next exact power of 2. 1 = 1, 2 = 2, 3 = 4, 4 = 4, 5 = 8, 9 = 16, etc.
 * @param {number} val The value to raise.
 * @return {number} val or the next higher power of 2.
 */
nmlorg.threed.shape.toNextPowerOf2 = function(val) {
  var log2 = Math.log(val) / Math.log(2);

  return Math.pow(2, Math.ceil(log2));
}


/**
 * Utility object to simplify loading an image and scheduling callbacks to run once it's loaded. Since 
 * this is primarily intended to be used for loading textures for {@link nmlorg.threed.shape.Shape}, if the 
 * image's dimensions are not exact powers of 2 they are stretched to the next power of 2.
 * @constructor
 * @param {string} src The URL of the image.
 */
nmlorg.threed.shape.Image = function(src) {
  this.callbacks = [];
  this.loaded = false;
  /** @type HTMLImageElement|HTMLCanvasElement */
  this.img = new Image();
  this.img.onload = function() {
    var width = nmlorg.threed.shape.toNextPowerOf2(this.img.naturalWidth);
    var height = nmlorg.threed.shape.toNextPowerOf2(this.img.naturalHeight);

    if ((width != this.img.naturalWidth) || (height != this.img.naturalHeight)) {
      var canvas = document.createElement('canvas');

      canvas.width = width;
      canvas.height = height;

      var ctx = canvas.getContext('2d');

      ctx.drawImage(this.img, 0, 0, this.img.naturalWidth, this.img.naturalHeight, 0, 0, width, height);
      this.img = canvas;
    }

    this.loaded = true;
    while (this.callbacks.length)
      this.callbacks.pop()(this.img);
  }.bind(this);
  this.img.src = src;
};


/**
 * Schedule f(this.img) to run as soon as this.img finishes loading, or immediately if it is already 
 * loaded.
 * @param {function(HTMLImageElement|HTMLCanvasElement)} f The callback.
 */
nmlorg.threed.shape.Image.prototype.run = function(f) {
  if (this.loaded)
    f(this.img);
  else
    this.callbacks.push(f);
};


})();
