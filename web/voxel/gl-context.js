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
  if (!this.textureShader_) {
    this.textureShader_ = this.makeShader(
        nmlorg.gl.TEXTURE_VERTEX_SHADER_SOURCE, nmlorg.gl.TEXTURE_FRAGMENT_SHADER_SOURCE);
  }

  this.textureShader_.bindTextures(texture);
  this.textureShader_.drawSquare();
};


nmlorg.gl.Context.prototype.makeFramebuffer = function() {
  return new nmlorg.gl.Framebuffer(this.gl);
};


nmlorg.gl.Context.prototype.makeShader = function(vertexShaderSource, fragmentShaderSource) {
  return new nmlorg.gl.Shader(this.gl, vertexShaderSource, fragmentShaderSource);
};

})();
