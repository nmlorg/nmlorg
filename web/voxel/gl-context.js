(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


/** @namespace */
nmlorg.gl = nmlorg.gl || {};


nmlorg.gl.Context = function(canvas) {
  var gl = this.gl = canvas.getContext('webgl');

  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  this.colorShader = new nmlorg.gl.Shader(
      this, nmlorg.gl.VERTEX_SHADER_SOURCE, nmlorg.gl.FRAGMENT_SHADER_SOURCE);
};


nmlorg.gl.Context.prototype.clear = function() {
  var gl = this.gl;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};


nmlorg.gl.Context.prototype.drawTriangles = function(position, numItems) {
  var gl = this.gl;

  gl.uniformMatrix4fv(this.colorShader.bufferPosition, false, position);
  gl.drawArrays(gl.TRIANGLES, 0, numItems);
};


nmlorg.gl.Context.prototype.makeColorBuffer = function(vertices) {
  return new nmlorg.gl.Buffer(this.gl, this.colorShader.vertexColor, vertices, 4);
};


nmlorg.gl.Context.prototype.makeFramebuffer = function() {
  return new nmlorg.gl.Framebuffer(this.gl);
};


nmlorg.gl.Context.prototype.makePositionBuffer = function(vertices) {
  return new nmlorg.gl.Buffer(this.gl, this.colorShader.vertexPosition, vertices, 3);
};


nmlorg.gl.Context.prototype.makeShape = function(positions, colors) {
  return new nmlorg.gl.Shape(this, positions, colors);
};


nmlorg.gl.Context.prototype.setCameraPosition = function(matrix) {
  var gl = this.gl;

  gl.uniformMatrix4fv(this.colorShader.cameraPosition, false, matrix);
};


nmlorg.gl.Context.prototype.setCameraProjection = function(matrix) {
  var gl = this.gl;

  gl.uniformMatrix4fv(this.colorShader.cameraProjection, false, matrix);
};

})();
