(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


nmlorg.Matrix = function(rows, cols) {
  this.rows = rows;
  this.cols = cols;
  this.m_ = new Array(rows * cols);
};


nmlorg.Matrix.identity = function(rows, cols) {
  var ret = new nmlorg.Matrix(rows, cols);

  for (var i = 0; i < rows; i++)
    for (var j = 0; j < cols; j++)
      ret.m_[i * cols + j] = (i == j) ? 1 : 0;
  return ret;
};


nmlorg.Matrix.zero = function(rows, cols) {
  var ret = new nmlorg.Matrix(rows, cols);

  for (var i = rows * cols - 1; i >= 0; i--)
    ret.m_[i] = 0;
  return ret;
};


nmlorg.Matrix.prototype.copy = function() {
  var ret = new nmlorg.Matrix(this.rows, this.cols);

  ret.m_ = this.m_.slice();
  return ret;
};


nmlorg.Matrix.prototype.multiply_ = function(n, m, p, A, B) {
  var ret = nmlorg.Matrix.zero(n, p);

  for (var i = 0; i < n; i++)
    for (var j = 0; j < p; j++)
      for (var k = 0; k < m; k++)
        ret.m_[i * p + j] += A[i * m + k] * B[k * p + j];
  return ret;
};


nmlorg.Matrix.prototype.multiply = function(rhs) {
  var n = this.rows, m = this.cols;

  if (rhs instanceof nmlorg.Matrix)
    rhs = rhs.m_;

  return this.multiply_(n, m, Math.floor(rhs.length / m), this.m_, rhs);
};

})();
