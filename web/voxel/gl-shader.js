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

  this.textureCoord = gl.getAttribLocation(program, 'textureCoord');
  if (this.textureCoord != -1)
    gl.enableVertexAttribArray(this.textureCoord);
  this.vertexColor = gl.getAttribLocation(program, 'vertexColor');
  if (this.vertexColor != -1)
    gl.enableVertexAttribArray(this.vertexColor);
  this.vertexPosition = gl.getAttribLocation(program, 'vertexPosition');
  if (this.vertexPosition != -1)
    gl.enableVertexAttribArray(this.vertexPosition);

  this.bufferPosition = gl.getUniformLocation(program, 'bufferPosition');
  this.cameraPosition = gl.getUniformLocation(program, 'cameraPosition');
  this.cameraProjection = gl.getUniformLocation(program, 'cameraProjection');
  this.textureSamplers = gl.getUniformLocation(program, 'textureSamplers');

  var resolution = gl.getUniformLocation(program, 'resolution');
  if (resolution)
    gl.uniform2f(resolution, gl.drawingBufferWidth, gl.drawingBufferHeight);

  this.setCameraProjection(nmlorg.gl.makeOrtho(-1, 1, -1, 1));
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
  if (!this.square_) {
    this.square_ = this.makeShape([-1, 1, 0, -1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, 1, -1, 0],
                                  [0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0]);
  }

  this.square_.draw([1, 0, 0, 0,
                     0, 1, 0, 0,
                     0, 0, 1, -1,
                     0, 0, 0, 1]);
};


nmlorg.gl.Shader.prototype.drawTriangles = function(position, numItems) {
  var gl = this.gl;
  this.activate();
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


nmlorg.gl.BLUR_FRAGMENT_SHADER_SOURCE = '\
varying mediump vec2 vTextureCoord;\
uniform sampler2D textureSamplers[1];\
uniform lowp vec2 resolution;\
\
lowp vec4 T(mediump float s, mediump float t) {\
  return texture2D(textureSamplers[0], vTextureCoord.st + vec2(s / resolution.s, t / resolution.t));\
}\
\
void main(void) {\
  gl_FragColor = (1. * T(-1.,  1.) + 2. * T(0.,  1.) + 1. * T(1.,  1.) +\
                  2. * T(-1.,  0.) + 4. * T(0.,  0.) + 2. * T(1.,  0.) +\
                  1. * T(-1., -1.) + 2. * T(0., -1.) + 1. * T(1., -1.)) / 16.;\
}\
';


nmlorg.gl.BLUR_VERTEX_SHADER_SOURCE = '\
attribute vec3 vertexPosition;\
attribute vec2 textureCoord;\
uniform mat4 bufferPosition;\
uniform mat4 cameraProjection;\
varying mediump vec2 vTextureCoord;\
\
void main(void) {\
  gl_Position = vec4(vertexPosition, 1.0) * bufferPosition * cameraProjection;\
  vTextureCoord = textureCoord;\
}\
';


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


nmlorg.gl.OUTLINE_FRAGMENT_SHADER_SOURCE = '\
varying mediump vec2 vTextureCoord;\
uniform sampler2D textureSamplers[2];\
uniform lowp vec2 resolution;\
\
lowp float GetDepth(lowp float s, lowp float t) {\
  lowp float depth = texture2D(textureSamplers[1], vTextureCoord.st + vec2(s / resolution.s, t / resolution.t)).x;\
  return depth;\
}\
\
void main(void) {\
  lowp float depth = GetDepth(0., 0.);\
  for (lowp float s = -3.; s <= 3.; s++) {\
    for (lowp float t = -3.; t <= 3.; t++) {\
      if ((s == 0.) && (t == 0.))\
        continue;\
      lowp float depth2 = GetDepth(s, t);\
      if (abs(depth - depth2) > .01) {\
        gl_FragColor = vec4(0, 0, 0, 1);\
        return;\
      }\
    }\
  }\
  gl_FragColor = texture2D(textureSamplers[0], vTextureCoord.st);\
}\
';


nmlorg.gl.OUTLINE_VERTEX_SHADER_SOURCE = '\
attribute vec3 vertexPosition;\
attribute vec2 textureCoord;\
uniform mat4 bufferPosition;\
uniform mat4 cameraProjection;\
varying mediump vec2 vTextureCoord;\
\
void main(void) {\
  gl_Position = vec4(vertexPosition, 1.0) * bufferPosition * cameraProjection;\
  vTextureCoord = textureCoord;\
}\
';


nmlorg.gl.TEXTURE_FRAGMENT_SHADER_SOURCE = '\
varying mediump vec2 vTextureCoord;\
uniform sampler2D textureSamplers[1];\
\
void main(void) {\
  gl_FragColor = texture2D(textureSamplers[0], vTextureCoord.st);\
}\
';


nmlorg.gl.TEXTURE_VERTEX_SHADER_SOURCE = '\
attribute vec3 vertexPosition;\
attribute vec2 textureCoord;\
uniform mat4 bufferPosition;\
uniform mat4 cameraProjection;\
varying mediump vec2 vTextureCoord;\
\
void main(void) {\
  gl_Position = vec4(vertexPosition, 1.0) * bufferPosition * cameraProjection;\
  vTextureCoord = textureCoord;\
}\
';

})();
