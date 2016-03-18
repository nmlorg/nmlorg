(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


/** @namespace */
nmlorg.gl = nmlorg.gl || {};


nmlorg.gl.Shader = function(context, vertexShaderSource, fragmentShaderSource) {
  this.context = context;
  var gl = context.gl;
  var program = this.program = gl.createProgram();
  gl.attachShader(program, this.compile(gl.VERTEX_SHADER, vertexShaderSource));
  gl.attachShader(program, this.compile(gl.FRAGMENT_SHADER, fragmentShaderSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw 'Error linking shader program.';
  this.bind();
  this.vertexPosition = gl.getAttribLocation(program, 'vertexPosition');
  if (this.vertexPosition != -1)
    gl.enableVertexAttribArray(this.vertexPosition);
  this.vertexColor = gl.getAttribLocation(program, 'vertexColor');
  if (this.vertexColor != -1)
    gl.enableVertexAttribArray(this.vertexColor);
  this.bufferPosition = gl.getUniformLocation(program, 'bufferPosition');
  this.cameraPosition = gl.getUniformLocation(program, 'cameraPosition');
  this.cameraProjection = gl.getUniformLocation(program, 'cameraProjection');
};


nmlorg.gl.Shader.prototype.bind = function() {
  var gl = this.context.gl;
  gl.useProgram(this.program);
};


nmlorg.gl.Shader.prototype.compile = function(type, source) {
  var gl = this.context.gl;
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    throw gl.getShaderInfoLog(shader);
  return shader;
};


nmlorg.gl.FRAGMENT_SHADER_SOURCE = '\
varying lowp vec4 vColor;\
\
void main(void) {\
  gl_FragColor = vColor;\
}\
';


nmlorg.gl.VERTEX_SHADER_SOURCE = '\
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

})();
