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
  this.colorShader = new nmlorg.gl.Shader(
      gl, nmlorg.gl.VERTEX_SHADER_SOURCE, nmlorg.gl.FRAGMENT_SHADER_SOURCE);
};


nmlorg.gl.Context.prototype.clear = function() {
  var gl = this.gl;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};

})();
