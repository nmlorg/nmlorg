(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


/** @namespace */
nmlorg.gl = nmlorg.gl || {};


nmlorg.gl.DoubleFramebuffer = function(gl) {
  this.buffers = [
      new nmlorg.gl.Framebuffer(gl),
      new nmlorg.gl.Framebuffer(gl),
  ];
};


nmlorg.gl.DoubleFramebuffer.prototype.activate = function() {
  return this.buffers[0].activate();
};


nmlorg.gl.DoubleFramebuffer.prototype.applyFilterShader = function(shader) {
  this.buffers[1].activate();
  shader.bindTextures(this.buffers[0].colorTexture, this.buffers[0].depthTexture);
  shader.drawSquare();
  this.buffers[1].deactivate();
  this.cycle();
};


nmlorg.gl.DoubleFramebuffer.prototype.cycle = function() {
  this.buffers.push(this.buffers.shift());
};


nmlorg.gl.DoubleFramebuffer.prototype.deactivate = function() {
  return this.buffers[0].deactivate();
};

})();
