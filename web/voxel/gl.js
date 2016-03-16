(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


nmlorg.GL = function(canvas) {
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
  this.cameraPosition = gl.getUniformLocation(shader, 'cameraPosition');
  this.cameraProjection = gl.getUniformLocation(shader, 'cameraProjection');
};


nmlorg.GL.prototype.clear = function() {
  var gl = this.gl;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};


nmlorg.GL.prototype.compileShader = function(type, source) {
  var gl = this.gl;
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    throw gl.getShaderInfoLog(shader);
  return shader;
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
uniform mat4 cameraPosition;\
uniform mat4 cameraProjection;\
varying lowp vec4 vColor;\
\
void main(void) {\
  gl_Position = cameraProjection * cameraPosition * vec4(vertexPosition, 1.0);\
  vColor = vertexColor;\
}\
';

})();
