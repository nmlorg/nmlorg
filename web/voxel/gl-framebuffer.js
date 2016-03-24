(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


/** @namespace */
nmlorg.gl = nmlorg.gl || {};


nmlorg.gl.Framebuffer = function(gl) {
  this.gl = gl;
  var extDepthTexture = gl.getExtension('WEBGL_depth_texture');
  var extDrawBuffers = gl.getExtension('WEBGL_draw_buffers');
  this.framebuffer = gl.createFramebuffer();
  this.activate();
  this.colorTexture = this.makeTexture(gl.RGBA, gl.UNSIGNED_BYTE);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D,
                          this.colorTexture.texture, 0);
  this.pickTexture = this.makeTexture(gl.RGBA, gl.UNSIGNED_BYTE);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, extDrawBuffers.COLOR_ATTACHMENT1_WEBGL, gl.TEXTURE_2D,
                          this.pickTexture.texture, 0);
  extDrawBuffers.drawBuffersWEBGL([
      gl.COLOR_ATTACHMENT0,
      extDrawBuffers.COLOR_ATTACHMENT1_WEBGL,
  ]);
  this.depthTexture = this.makeTexture(gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D,
                          this.depthTexture.texture, 0);
  gl.bindTexture(gl.TEXTURE_2D, null);
  this.deactivate();
};


nmlorg.gl.Framebuffer.prototype.activate = function() {
  var gl = this.gl;
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
};


nmlorg.gl.Framebuffer.prototype.deactivate = function() {
  var gl = this.gl;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};


nmlorg.gl.Framebuffer.prototype.get3dCoord = function(x, y) {
  var gl = this.gl;
  var buf = new Uint8Array(4);
  var isBound = gl.getParameter(gl.FRAMEBUFFER_BINDING) === this.framebuffer;
  if (!isBound)
    this.activate();
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D,
                          this.pickTexture.texture, 0);
  gl.readPixels(gl.drawingBufferWidth * (x + 1) / 2, gl.drawingBufferHeight * (y + 1) / 2, 1, 1,
                gl.RGBA, gl.UNSIGNED_BYTE, buf);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D,
                          this.colorTexture.texture, 0);
  if (!isBound)
    this.deactivate();
  return [buf[0], buf[1], buf[2]];
};


nmlorg.gl.Framebuffer.prototype.makeTexture = function(format, type) {
  return new nmlorg.gl.Framebuffer.Texture(this.gl, format, type);
};


nmlorg.gl.Framebuffer.Texture = function(gl, format, type) {
  this.gl = gl;
  var texture = this.texture = gl.createTexture();
  this.load();
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, format, gl.drawingBufferWidth, gl.drawingBufferHeight, 0, format,
                type, null);
};


nmlorg.gl.Framebuffer.Texture.prototype.load = function() {
  var gl = this.gl;
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
};

})();
