(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


/** @namespace */
nmlorg.gl = nmlorg.gl || {};


nmlorg.gl.Shape = function(context, positions, colors) {
  this.context = context;
  this.positionBuffer = context.makePositionBuffer(positions);
  this.colorBuffer = context.makeColorBuffer(colors);
  if (this.positionBuffer.numItems != this.colorBuffer.numItems)
    throw 'There must be one color for every position.';
};


nmlorg.gl.Shape.prototype.draw = function(position) {
  this.positionBuffer.load();
  this.colorBuffer.load();
  this.context.drawTriangles(position, this.positionBuffer.numItems);
};

})();
