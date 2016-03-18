(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


/** @namespace */
nmlorg.gl = nmlorg.gl || {};


nmlorg.gl.Shape = function(shader, positions, colors) {
  this.shader = shader;
  this.positionBuffer = shader.makePositionBuffer(positions);
  this.colorBuffer = shader.makeColorBuffer(colors);
  if (this.positionBuffer.numItems != this.colorBuffer.numItems)
    throw 'There must be one color for every position.';
};


nmlorg.gl.Shape.prototype.draw = function(position) {
  this.positionBuffer.load();
  this.colorBuffer.load();
  this.shader.drawTriangles(position, this.positionBuffer.numItems);
};

})();
