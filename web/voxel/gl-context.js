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
};


nmlorg.gl.Context.prototype.clear = function() {
  var gl = this.gl;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};


nmlorg.gl.Context.prototype.drawTexture = function(texture) {
  if (!this.textureShader_)
    this.textureShader_ = this.loadShader('texture');

  this.textureShader_.bindTextures(texture);
  this.textureShader_.drawSquare();
};


nmlorg.gl.Context.prototype.loadShader = function(name) {
  if (!this.shaders_)
    this.shaders_ = {};
  if (!this.shaders_[name]) {
    var fragmentReq = new XMLHttpRequest();
    fragmentReq.open('GET', 'shaders/' + name + '.fragment.glsl', false);
    fragmentReq.send();
    var vertexReq = new XMLHttpRequest();
    vertexReq.open('GET', 'shaders/' + name + '.vertex.glsl', false);
    vertexReq.send();
    this.shaders_[name] = this.makeShader(vertexReq.responseText, fragmentReq.responseText);
  }
  return this.shaders_[name];
};


nmlorg.gl.Context.prototype.makeDoubleFramebuffer = function() {
  return new nmlorg.gl.DoubleFramebuffer(this.gl);
};


nmlorg.gl.Context.prototype.makeFramebuffer = function() {
  return new nmlorg.gl.Framebuffer(this.gl);
};


nmlorg.gl.Context.prototype.makeShader = function(vertexShaderSource, fragmentShaderSource) {
  return new nmlorg.gl.Shader(this.gl, vertexShaderSource, fragmentShaderSource);
};

})();
