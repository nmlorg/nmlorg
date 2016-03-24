(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


/** @namespace */
nmlorg.gl = nmlorg.gl || {};


nmlorg.gl.Shader = function(gl, vertexShaderSource, fragmentShaderSource) {
  this.gl = gl;
  gl.getExtension('EXT_frag_depth');
  gl.getExtension('WEBGL_draw_buffers');
  var program = this.program = gl.createProgram();
  gl.attachShader(program, this.compile(gl.VERTEX_SHADER, vertexShaderSource));
  gl.attachShader(program, this.compile(gl.FRAGMENT_SHADER, fragmentShaderSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw 'Error linking shader program.';
  this.activate();

  this.textureCoord = gl.getAttribLocation(program, 'textureCoord');
  if (this.textureCoord != -1)
    gl.enableVertexAttribArray(this.textureCoord);
  this.vertexColor = gl.getAttribLocation(program, 'vertexColor');
  if (this.vertexColor != -1)
    gl.enableVertexAttribArray(this.vertexColor);
  this.vertexPosition = gl.getAttribLocation(program, 'vertexPosition');
  if (this.vertexPosition != -1)
    gl.enableVertexAttribArray(this.vertexPosition);

  this.box = gl.getUniformLocation(program, 'box');
  this.bufferPosition = gl.getUniformLocation(program, 'bufferPosition');
  this.cameraPosition = gl.getUniformLocation(program, 'cameraPosition');
  this.cameraProjection = gl.getUniformLocation(program, 'cameraProjection');
  this.textureSamplers = gl.getUniformLocation(program, 'textureSamplers');

  var resolution = gl.getUniformLocation(program, 'resolution');
  if (resolution)
    gl.uniform2f(resolution, gl.drawingBufferWidth, gl.drawingBufferHeight);
};


nmlorg.gl.Shader.prototype.activate = function() {
  var gl = this.gl;
  gl.useProgram(this.program);
};


nmlorg.gl.Shader.prototype.bindTextures = function() {
  var gl = this.gl;
  var textures = Array.from(arguments);
  var slots = [];
  this.activate();
  for (var slot = 0; slot < textures.length; slot++) {
    gl.activeTexture(gl['TEXTURE' + slot]);
    textures[slot].load();
    slots.push(slot);
  }
  gl.uniform1iv(this.textureSamplers, slots);
};


nmlorg.gl.Shader.prototype.compile = function(type, source) {
  var gl = this.gl;
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    throw gl.getShaderInfoLog(shader);
  return shader;
};


nmlorg.gl.Shader.prototype.drawSquare = function() {
  var gl = this.gl;
  if (!this.square_) {
    this.square_ = this.makeShape([-1, 1, 0, -1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, 1, -1, 0],
                                  [0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0]);
  }

  gl.clear(gl.DEPTH_BUFFER_BIT);
  this.square_.draw();
};


nmlorg.gl.Shader.prototype.drawTriangles = function(position, numItems) {
  var gl = this.gl;
  this.activate();
  if (position)
    gl.uniformMatrix4fv(this.bufferPosition, false, position);
  gl.drawArrays(gl.TRIANGLES, 0, numItems);
};


nmlorg.gl.Shader.prototype.getCameraPosition = function() {
  var gl = this.gl;
  return gl.getUniform(this.program, this.cameraPosition);
};


nmlorg.gl.Shader.prototype.getCameraProjection = function() {
  var gl = this.gl;
  return gl.getUniform(this.program, this.cameraProjection);
};


nmlorg.gl.Shader.prototype.makeColorBuffer = function(vertices) {
  return new nmlorg.gl.Buffer(this.gl, this.vertexColor, vertices, 4);
};


nmlorg.gl.Shader.prototype.makePositionBuffer = function(vertices) {
  return new nmlorg.gl.Buffer(this.gl, this.vertexPosition, vertices, 3);
};


nmlorg.gl.Shader.prototype.makeShape = function() {
  var args = Array.from(arguments);
  var buffers = [];

  if (this.vertexPosition != -1)
    buffers.push(this.makePositionBuffer(args.shift()));
  if (this.vertexColor != -1)
    buffers.push(this.makeColorBuffer(args.shift()));
  if (this.textureCoord != -1)
    buffers.push(this.makeTextureBuffer(args.shift()));

  return new nmlorg.gl.Shape(this, buffers);
};


nmlorg.gl.Shader.prototype.makeTextureBuffer = function(vertices) {
  return new nmlorg.gl.Buffer(this.gl, this.textureCoord, vertices, 2);
};


nmlorg.gl.Shader.prototype.setBox = function(left, right, bottom, top) {
  if (left === undefined)
    left = -1;
  if (right === undefined)
    right = 1;
  if (bottom === undefined)
    bottom = -1;
  if (top === undefined)
    top = 1;
  var gl = this.gl;
  this.activate();
  gl.uniform4f(this.box, left, right, bottom, top);
};


nmlorg.gl.Shader.prototype.setCameraPosition = function(matrix) {
  var gl = this.gl;
  this.activate();
  gl.uniformMatrix4fv(this.cameraPosition, false, matrix);
};


nmlorg.gl.Shader.prototype.setCameraProjection = function(matrix) {
  var gl = this.gl;
  this.activate();
  gl.uniformMatrix4fv(this.cameraProjection, false, matrix);
};

})();
