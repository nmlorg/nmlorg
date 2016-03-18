(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


/** @namespace */
nmlorg.gl = nmlorg.gl || {};


nmlorg.gl.Shape = function(shader, buffers) {
  this.shader = shader;
  this.buffers = buffers;
  for (var i = 1; i < buffers.length; i++)
    if (buffers[i].numItems != buffers[0].numItems)
      throw 'There must be one color for every position.';
};


nmlorg.gl.Shape.prototype.draw = function(position) {
  var shader = this.shader;
  var buffers = this.buffers;
  for (var buffer of buffers)
    buffer.load();
  shader.drawTriangles(position, buffers[0].numItems);
};

})();
