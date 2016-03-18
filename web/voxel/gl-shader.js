(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


/** @namespace */
nmlorg.gl = nmlorg.gl || {};


nmlorg.gl.Shader = function(gl, vertexShaderSource, fragmentShaderSource) {
  this.gl = gl;
  var program = this.program = gl.createProgram();
  gl.attachShader(program, this.compile(gl.VERTEX_SHADER, vertexShaderSource));
  gl.attachShader(program, this.compile(gl.FRAGMENT_SHADER, fragmentShaderSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw 'Error linking shader program.';
  this.activate();
  this.vertexPosition = gl.getAttribLocation(program, 'vertexPosition');
  if (this.vertexPosition != -1)
    gl.enableVertexAttribArray(this.vertexPosition);
  this.vertexColor = gl.getAttribLocation(program, 'vertexColor');
  if (this.vertexColor != -1)
    gl.enableVertexAttribArray(this.vertexColor);
  this.textureCoord = gl.getAttribLocation(program, 'textureCoord');
  if (this.textureCoord != -1)
    gl.enableVertexAttribArray(this.textureCoord);
  this.bufferPosition = gl.getUniformLocation(program, 'bufferPosition');
  this.cameraPosition = gl.getUniformLocation(program, 'cameraPosition');
  this.cameraProjection = gl.getUniformLocation(program, 'cameraProjection');
  this.textureSampler = gl.getUniformLocation(program, 'textureSampler');
};


nmlorg.gl.Shader.prototype.activate = function() {
  var gl = this.gl;
  gl.useProgram(this.program);
};


nmlorg.gl.Shader.prototype.bindTexture = function(texture, slot) {
  var gl = this.gl;
  this.activate();
  gl.activeTexture(gl['TEXTURE' + slot]);
  texture.load();
  gl.uniform1i(this.textureSampler, slot);
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


nmlorg.gl.Shader.prototype.drawTriangles = function(position, numItems) {
  var gl = this.gl;
  this.activate();
  gl.uniformMatrix4fv(this.bufferPosition, false, position);
  gl.drawArrays(gl.TRIANGLES, 0, numItems);
};


nmlorg.gl.Shader.prototype.makeColorBuffer = function(vertices) {
  return new nmlorg.gl.Buffer(this.gl, this.vertexColor, vertices, 4);
};


nmlorg.gl.Shader.prototype.makePositionBuffer = function(vertices) {
  return new nmlorg.gl.Buffer(this.gl, this.vertexPosition, vertices, 3);
};


nmlorg.gl.Shader.prototype.makeShape = function() {
  var args = [...arguments];
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


nmlorg.gl.COLOR_FRAGMENT_SHADER_SOURCE = '\
varying lowp vec4 vColor;\
\
void main(void) {\
  gl_FragColor = vColor;\
}\
';


nmlorg.gl.COLOR_VERTEX_SHADER_SOURCE = '\
attribute vec3 vertexPosition;\
attribute vec4 vertexColor;\
uniform mat4 bufferPosition;\
uniform mat4 cameraPosition;\
uniform mat4 cameraProjection;\
varying lowp vec4 vColor;\
\
void main(void) {\
  gl_Position = vec4(vertexPosition, 1.0) * bufferPosition * cameraPosition * cameraProjection;\
  vColor = vertexColor;\
}\
';


nmlorg.gl.TEXTURE_FRAGMENT_SHADER_SOURCE = '\
varying mediump vec2 vTextureCoord;\
uniform sampler2D textureSampler;\
\
void main(void) {\
  gl_FragColor = texture2D(textureSampler, vec2(vTextureCoord.s, vTextureCoord.t));\
}\
';


nmlorg.gl.TEXTURE_VERTEX_SHADER_SOURCE = '\
attribute vec3 vertexPosition;\
attribute vec2 textureCoord;\
uniform mat4 bufferPosition;\
uniform mat4 cameraPosition;\
uniform mat4 cameraProjection;\
varying mediump vec2 vTextureCoord;\
\
void main(void) {\
  gl_Position = vec4(vertexPosition, 1.0) * bufferPosition * cameraPosition * cameraProjection;\
  vTextureCoord = textureCoord;\
}\
';

})();
