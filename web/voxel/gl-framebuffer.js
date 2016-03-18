(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


/** @namespace */
nmlorg.gl = nmlorg.gl || {};


nmlorg.gl.Framebuffer = function(gl) {
  this.gl = gl;
  var ext = gl.getExtension('WEBGL_depth_texture');

  this.framebuffer = gl.createFramebuffer();
  this.bind();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

  this.colorTexture = this.makeTexture(gl.RGBA, gl.UNSIGNED_BYTE);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D,
                          this.colorTexture.texture, 0);
  this.depthTexture = this.makeTexture(gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D,
                          this.depthTexture.texture, 0);
  gl.bindTexture(gl.TEXTURE_2D, null);
  this.unbind();
};


nmlorg.gl.Framebuffer.prototype.bind = function() {
  var gl = this.gl;
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
};


nmlorg.gl.Framebuffer.prototype.makeTexture = function(format, type) {
  return new nmlorg.gl.Framebuffer.Texture(this.gl, format, type);
};


nmlorg.gl.Framebuffer.prototype.unbind = function() {
  var gl = this.gl;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};


nmlorg.gl.Framebuffer.Texture = function(gl, format, type) {
  this.gl = gl;
  var texture = this.texture = gl.createTexture();
  this.bind();
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, format, gl.drawingBufferWidth, gl.drawingBufferHeight, 0, format,
                type, null);
};


nmlorg.gl.Framebuffer.Texture.prototype.bind = function() {
  var gl = this.gl;
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
};

})();
