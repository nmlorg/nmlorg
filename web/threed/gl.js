/**
 * @fileoverview Routines for manipulating &lt;canvas&gt; elements and rendering using WebGL.
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg.require('mat4');
nmlorg.require('nmlorg.threed.projection');


/** @namespace */
nmlorg.threed.gl = nmlorg.threed.gl || {};


/**
 * Create a &lt;canvas&gt; element.
 * @param {number} width The width of the canvas.
 * @param {number} height The height of the canvas.
 * @return {HTMLCanvasElement}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement
 */
nmlorg.threed.gl.createCanvas = function(width, height) {
  var canvas = document.createElement('canvas');

  document.body.appendChild(canvas);
  canvas.width = width;
  canvas.height = height;
  return canvas;
};


/**
 * Create a WebGL rendering context.
 * @param {HTMLCanvasElement} canvas A &lt;canvas&gt; element.
 * @return {WebGLRenderingContext}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext
 */
nmlorg.threed.gl.createContext = function(canvas) {
  var gl = canvas.getContext('experimental-webgl') || canvas.getContext('webgl');

  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  return gl;
};


/**
 * A rectangle in which a world is rendered. Each canvas includes its own camera matrix, and so can use 
 * a different projection or camera location. Pass in either an existing &lt;canvas&gt; element or the 
 * width and height to pass to {@link nmlorg.threed.gl.createCanvas}.
 * @param {number|HTMLCanvasElement} [width_or_canvas]
 * @param {number} [height]
 * @constructor
 */
nmlorg.threed.gl.Canvas = function() {
  if (arguments.length == 1) {
    this.canvas = arguments[0];
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  } else if (arguments.length == 2) {
    this.width = arguments[0];
    this.height = arguments[1];
    this.canvas = nmlorg.threed.gl.createCanvas(this.width, this.height);
  } else {
    throw 'Usage: nmlorg.threed.gl.Canvas(canvas) or nmlorg.threed.gl.Canvas(width, height)';
  }

  this.gl = nmlorg.threed.gl.createContext(this.canvas);
  this.shaders = {};
  this.numTextures = 0;
  this.cameraPosition = mat4.create();
  this.setOrtho(-this.width / 2, this.width / 2, -this.height / 2, this.height / 2);
  this.setCamera(0, 0, 0);
};


/**
 * Clear the canvas, replacing it with an all-black field.
 */
nmlorg.threed.gl.Canvas.prototype.reset = function() {
  var gl = this.gl;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};


nmlorg.threed.gl.Canvas.prototype.compileShader_ = function(src, type) {
  var gl = this.gl;
  var shader;

  if (type == 'x-shader/x-fragment') {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (type == 'x-shader/x-vertex') {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    throw 'Unknown shader type ' + type + ' for:\n' + src;
  }

  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw 'Unable to compile shader:\n' + gl.getShaderInfoLog(shader);
  }

  return shader;
};


var SHADERS = {
    'color': {
        'x-shader/x-fragment': '\
            varying lowp vec4 vColor;\
            \
            void main(void) {\
              gl_FragColor = vColor;\
            }\
        ',
        'x-shader/x-vertex': '\
            attribute vec3 aVertexPosition;\
            attribute vec4 aVertexColor;\
            \
            uniform mat4 uPositionMatrix;\
            uniform mat4 uProjectionMatrix;\
            \
            varying lowp vec4 vColor;\
            \
            void main(void) {\
              gl_Position = uProjectionMatrix * uPositionMatrix * vec4(aVertexPosition, 1.0);\
              vColor = aVertexColor;\
            }\
        ',
    },
    'texture': {
        'x-shader/x-fragment': '\
            varying mediump vec2 vTextureCoord;\
            \
            uniform sampler2D uSampler;\
            \
            void main(void) {\
              gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\
            }\
        ',
        'x-shader/x-vertex': '\
            attribute vec3 aVertexPosition;\
            attribute vec2 aTextureCoord;\
            \
            uniform mat4 uPositionMatrix;\
            uniform mat4 uProjectionMatrix;\
            \
            varying mediump vec2 vTextureCoord;\
            \
            void main(void) {\
              gl_Position = uProjectionMatrix * uPositionMatrix * vec4(aVertexPosition, 1.0);\
              vTextureCoord = aTextureCoord;\
            }\
        ',
    },
};


nmlorg.threed.gl.Canvas.prototype.getShader_ = function(type) {
  if (!(type in this.shaders)) {
    console.log('Creating ' + type + ' shader.');

    var objects = [];

    for (var shaderType in SHADERS[type])
      objects.push(this.compileShader_(SHADERS[type][shaderType], shaderType));

    this.shaders[type] = this.currentShader = new nmlorg.threed.gl.Shader(this, objects);
    this.setProjection();
  }

  var shader = this.shaders[type];

  shader.bindProgram();
  return shader;
};


/** @constructor */
nmlorg.threed.gl.Shader = function(canvas, objects) {
  this.canvas = canvas;
  var gl = this.gl = canvas.gl;
  var shaderProgram = this.program = gl.createProgram();

  for (var i = 0; i < objects.length; i++)
    gl.attachShader(shaderProgram, objects[i]);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw 'Could not initialize shaders.';
  }

  gl.useProgram(shaderProgram);

  this.vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'aVertexColor');
  if (this.vertexColorAttribute != -1)
    gl.enableVertexAttribArray(this.vertexColorAttribute);

  this.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  if (this.vertexPositionAttribute != -1)
    gl.enableVertexAttribArray(this.vertexPositionAttribute);

  this.textureCoordAttribute = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
  if (this.textureCoordAttribute != -1)
    gl.enableVertexAttribArray(this.textureCoordAttribute);

  this.positionMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPositionMatrix');
  this.projectionMatrixUniform = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
  this.samplerUniform = gl.getUniformLocation(shaderProgram, 'uSampler');
};


nmlorg.threed.gl.Shader.prototype.bindProgram = function() {
  if (this.canvas.currentShader != this) {
    this.gl.useProgram(this.program);
    this.canvas.currentShader = this;
  }
};


nmlorg.threed.gl.Canvas.prototype.setProjection = function() {
  var gl = this.gl;

  this.cameraMatrix = mat4.create();
  mat4.multiply(this.projectionMatrix, this.cameraPosition, this.cameraMatrix);

  for (var type in this.shaders)
    gl.uniformMatrix4fv(this.getShader_(type).projectionMatrixUniform, false, this.cameraMatrix);
};


/**
 * Change the projection matrix to model an arbitrary frustum.
 * @param {number} left The x coordinate of the left edge of the near plane.
 * @param {number} right The x coordinate of the right edge of the near plane.
 * @param {number} bottom The y coordinate of the bottom edge of the near plane.
 * @param {number} top The y coordinate of the top edge of the near plane.
 * @param {number} nearPlane The z coordinate of the near plane.
 * @param {number} farPlane The z coordinate of the far plane.
 * @see nmlorg.threed.projection.Frustum
 */
nmlorg.threed.gl.Canvas.prototype.setFrustum = function(left, right, bottom, top, nearPlane, farPlane) {
  var frustum = new nmlorg.threed.projection.Frustum(left, right, bottom, top, nearPlane, farPlane);

  this.projectionMatrix = nmlorg.threed.projection.toGLMatrix(frustum.toMatrix());
  this.setProjection();
};


/**
 * Change the projection matrix to model a frustum shaped based on the given field of view.
 * @param {number} angle The field of view from bottom to top.
 * @param {number} nearPlane The z coordinate of the near plane.
 * @param {number} farPlane The z coordinate of the far plane.
 * @see nmlorg.threed.projection.Frustum.fromPerspective
 */
nmlorg.threed.gl.Canvas.prototype.setPerspective = function(angle, nearPlane, farPlane) {
  var frustum = nmlorg.threed.projection.Frustum.fromPerspective(angle, this.width / this.height, nearPlane, farPlane);

  this.projectionMatrix = nmlorg.threed.projection.toGLMatrix(frustum.toMatrix());
  this.setProjection();
};


/**
 * Change the projection matrix to model a rectangular box.
 * @param {number} left The x coordinate of the left edge of the near plane.
 * @param {number} right The x coordinate of the right edge of the near plane.
 * @param {number} bottom The y coordinate of the bottom edge of the near plane.
 * @param {number} top The y coordinate of the top edge of the near plane.
 * @param {number} nearPlane The z coordinate of the near plane.
 * @param {number} farPlane The z coordinate of the far plane.
 * @see nmlorg.threed.projection.Box
 */
nmlorg.threed.gl.Canvas.prototype.setOrtho = function(left, right, bottom, top, nearPlane, farPlane) {
  var box = new nmlorg.threed.projection.Box(left, right, bottom, top, nearPlane, farPlane);

  this.projectionMatrix = nmlorg.threed.projection.toGLMatrix(box.toMatrix());
  this.setProjection();
};


/**
 * Change the projection matrix to model a rectangular box using a frustum. The visual effect should be 
 * similar to setOrtho, but under the hood setOrthoFrustum uses a frustum at a very far distance (like a 
 * telephoto camera lens), so its sides are nearly parallel. This is mostly useful for linearly 
 * interpolating between an orthographic[-like] projection and a more-pronounced frustum.
 * @param {number} left The x coordinate of the left edge of the near plane.
 * @param {number} right The x coordinate of the right edge of the near plane.
 * @param {number} bottom The y coordinate of the bottom edge of the near plane.
 * @param {number} top The y coordinate of the top edge of the near plane.
 * @param {number} nearPlane The z coordinate of the near plane.
 * @param {number} farPlane The z coordinate of the far plane.
 * @see nmlorg.threed.projection.Frustum.fromOrtho
 */
nmlorg.threed.gl.Canvas.prototype.setOrthoFrustum = function(left, right, bottom, top, nearPlane, farPlane) {
  var frustum = new nmlorg.threed.projection.Frustum.fromOrtho(left, right, bottom, top, nearPlane, farPlane);

  this.projectionMatrix = nmlorg.threed.projection.toGLMatrix(frustum.toMatrix());
  this.setProjection();
};


/**
 * Set the camera's position and optional orientation. If the orientation is not provided, the camera is 
 * pointed facing down the negative z axis with the positive y axis above it.
 * @param {number} x The camera's x position.
 * @param {number} y The camera's y position.
 * @param {number} z The camera's z position.
 * @param {number} [cx] The x coordinate of the point the camera is facing.
 * @param {number} [cy] The y coordinate of the point the camera is facing.
 * @param {number} [cz] The z coordinate of the point the camera is facing.
 * @param {number} [upx] The x component of the camera's "up" vector (the x coordinate of a point 
 *     relative to the camera that is above the camera).
 * @param {number} [upy] The y component of the camera's "up" vector.
 * @param {number} [upz] The z component of the camera's "up" vector.
 */
nmlorg.threed.gl.Canvas.prototype.setCamera = function(x, y, z, cx, cy, cz, upx, upy, upz) {
  if (cx === undefined) {
    cx = x;
    cy = y;
    cz = z - 1;
  }
  if (upx === undefined) {
    upx = 0;
    upy = 1;
    upz = 0;
  }
  this.cameraPosition = mat4.lookAt([x, y, z], [cx, cy, cz], [upx, upy, upz]);
  this.setProjection();
};


nmlorg.threed.gl.Canvas.prototype.getScreenCoords = function(x, y, z) {
  var pos = [0, 0, 0, 1];

  mat4.multiplyVec4(this.cameraMatrix, [x, y, z, 1], pos);

  return [
      (pos[0] / pos[3] + 1) * this.width / 2,
      (pos[1] / pos[3] + 1) * this.height / 2,
      pos[2] / pos[3],
  ];
};


nmlorg.threed.gl.Canvas.prototype.getWorldCoords = function(x, y, z) {
  var inverseCamera = mat4.create();
  var pos = [0, 0, 0, 1];

  mat4.inverse(this.cameraMatrix, inverseCamera);
  mat4.multiplyVec4(inverseCamera, [2 * x / this.width - 1, 2 * y / this.height - 1, z, 1], pos);

  return [pos[0] / pos[3], pos[1] / pos[3], pos[2] / pos[3]];
};


nmlorg.threed.gl.Canvas.prototype.makeBuffer = function(vertices, itemSize) {
  return new nmlorg.threed.gl.Buffer(this, vertices, itemSize);
};


/** @constructor */
nmlorg.threed.gl.Buffer = function(canvas, vertices, itemSize) {
  var gl = this.gl = canvas.gl;

  this.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  this.itemSize = itemSize;
  this.numItems = vertices.length / itemSize;
};


nmlorg.threed.gl.Buffer.prototype.apply = function(shaderAttribute) {
  var gl = this.gl;

  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.vertexAttribPointer(shaderAttribute, this.itemSize, gl.FLOAT, false, 0, 0);
};


nmlorg.threed.gl.Canvas.prototype.makeShape = function(shape) {
  return new nmlorg.threed.gl.Shape(this, shape);
};


var VALUE_TYPES = {
    'color': 'vertexColorAttribute',
    'position': 'vertexPositionAttribute',
    'texture': 'textureCoordAttribute',
};


/**
 * @param {nmlorg.threed.gl.Canvas} canvas
 * @param {nmlorg.threed.shape.Shape} shape
 * @constructor
 */
nmlorg.threed.gl.Shape = function(canvas, shape) {
  var gl = this.gl = canvas.gl;
  this.vertexType = gl[shape.vertexType];
  this.numItems = shape.numVertices;
  this.buffers = [];

  if ('color' in shape.vertexGroups)
    this.shader = canvas.getShader_('color');
  else
    this.shader = canvas.getShader_('texture');

  for (var valueType in shape.vertexGroups) {
    var vertices = shape.vertexGroups[valueType];
    var buffer = canvas.makeBuffer(vertices, vertices.length / shape.numVertices);

    this.buffers.push(buffer.apply.bind(buffer, this.shader[VALUE_TYPES[valueType]]));

    if (valueType == 'texture') {
      var texture = canvas.makeTexture(shape.textureImage, canvas.numTextures++);

      this.buffers.push(texture.apply.bind(texture, this.shader, this.shader.samplerUniform));
    }
  }
};


nmlorg.threed.gl.Canvas.prototype.makeTexture = function(image, textureNum) {
  return new nmlorg.threed.gl.Texture(this, image, textureNum);
};


/** @constructor */
nmlorg.threed.gl.Texture = function(canvas, image, textureNum) {
  console.log('Creating texture ' + textureNum + '.');

  var gl = this.gl = canvas.gl;

  this.texture = gl.createTexture();
  this.textureNum = textureNum;
  image.run(this.bindImage.bind(this));

  gl.activeTexture(gl['TEXTURE' + this.textureNum]);
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
};


nmlorg.threed.gl.Texture.prototype.bindImage = function(img) {
  var gl = this.gl;

  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
};


nmlorg.threed.gl.Texture.prototype.apply = function(shader, shaderUniform) {
  var gl = this.gl;

  shader.bindProgram();
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  gl.uniform1i(shaderUniform, this.textureNum);
};


/**
 * Load the shape's vertices in the shader.
 */
nmlorg.threed.gl.Shape.prototype.preload = function() {
  for (var i = 0; i < this.buffers.length; i++)
    this.buffers[i]();
};


/**
 * Draw the shape's vertices at the given position.
 * @param {Array.<number>} position A 4x4 matrix representing the location and orientation of the shape.
 */
nmlorg.threed.gl.Shape.prototype.drawPreloaded = function(position) {
  var shader = this.shader;
  var gl = this.gl;

  shader.bindProgram();
  gl.uniformMatrix4fv(shader.positionMatrixUniform, false, position);
  gl.drawArrays(this.vertexType, 0, this.numItems);
};


/**
 * Load the shape's vertices in the shader, then draw it at the given position (<code>preload()</code> 
 * followed by <code>drawPreloaded(position)</code>).
 * @param {Array.<number>} position A 4x4 matrix representing the location and orientation of the shape.
 */
nmlorg.threed.gl.Shape.prototype.draw = function(position) {
  this.preload();
  this.drawPreloaded(position);
};


})();
