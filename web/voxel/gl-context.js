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

  var shader = gl.createProgram();
  gl.attachShader(shader, this.compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE));
  gl.attachShader(shader, this.compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE));
  gl.linkProgram(shader);
  if (!gl.getProgramParameter(shader, gl.LINK_STATUS))
    throw 'Error linking shader program.';
  gl.useProgram(shader);
  this.vertexPosition = gl.getAttribLocation(shader, 'vertexPosition');
  if (this.vertexPosition != -1)
    gl.enableVertexAttribArray(this.vertexPosition);
  this.vertexColor = gl.getAttribLocation(shader, 'vertexColor');
  if (this.vertexColor != -1)
    gl.enableVertexAttribArray(this.vertexColor);
  this.bufferPosition = gl.getUniformLocation(shader, 'bufferPosition');
  this.cameraProjection = gl.getUniformLocation(shader, 'cameraProjection');
};


nmlorg.gl.Context.prototype.clear = function() {
  var gl = this.gl;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};


nmlorg.gl.Context.prototype.compileShader = function(type, source) {
  var gl = this.gl;
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    throw gl.getShaderInfoLog(shader);
  return shader;
};


nmlorg.gl.Context.prototype.drawTriangles = function(position, numItems) {
  var gl = this.gl;

  gl.uniformMatrix4fv(this.bufferPosition, false, position);
  gl.drawArrays(gl.TRIANGLES, 0, numItems);
};


nmlorg.gl.Context.prototype.makeColorBuffer = function(vertices) {
  return new nmlorg.gl.Buffer(this.gl, this.vertexColor, vertices, 4);
};


nmlorg.gl.Context.prototype.makePositionBuffer = function(vertices) {
  return new nmlorg.gl.Buffer(this.gl, this.vertexPosition, vertices, 3);
};


nmlorg.gl.Context.prototype.makeShape = function(positions, colors) {
  return new nmlorg.gl.Shape(this, positions, colors);
};


nmlorg.gl.Context.prototype.setCamera = function(matrix) {
  var gl = this.gl;

  gl.uniformMatrix4fv(this.cameraProjection, false, matrix);
};


var FRAGMENT_SHADER_SOURCE = '\
varying lowp vec4 vColor;\
\
void main(void) {\
  gl_FragColor = vColor;\
}\
';

var VERTEX_SHADER_SOURCE = '\
attribute vec3 vertexPosition;\
attribute vec4 vertexColor;\
uniform mat4 bufferPosition;\
uniform mat4 cameraProjection;\
varying lowp vec4 vColor;\
\
void main(void) {\
  gl_Position = cameraProjection * bufferPosition * vec4(vertexPosition, 1.0);\
  vColor = vertexColor;\
}\
';

})();
