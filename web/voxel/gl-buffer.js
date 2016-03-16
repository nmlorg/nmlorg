(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


/** @namespace */
nmlorg.gl = nmlorg.gl || {};


nmlorg.gl.Buffer = function(gl, where, vertices, itemSize) {
  this.gl = gl;
  this.where = where;
  this.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  this.itemSize = itemSize;
  this.numItems = vertices.length / itemSize;
};


nmlorg.gl.Buffer.prototype.load = function() {
  var gl = this.gl;

  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.vertexAttribPointer(this.where, this.itemSize, gl.FLOAT, false, 0, 0);
};

})();
