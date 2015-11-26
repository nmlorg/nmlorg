(function() {

/** @namespace */
spacex = window.spacex || {};


spacex.Matrix = function(rows, cols) {
  this.rows = rows;
  this.cols = cols;
  this.m_ = new Array(rows * cols);
};


spacex.Matrix.identity = function(rows, cols) {
  var ret = new spacex.Matrix(rows, cols);

  for (var i = 0; i < rows; i++)
    for (var j = 0; j < cols; j++)
      ret.m_[i * cols + j] = (i == j) ? 1 : 0;
  return ret;
};


spacex.Matrix.zero = function(rows, cols) {
  var ret = new spacex.Matrix(rows, cols);

  for (var i = rows * cols - 1; i >= 0; i--)
    ret.m_[i] = 0;
  return ret;
};


spacex.Matrix.prototype.multiply_ = function(n, m, p, A, B) {
  var ret = spacex.Matrix.zero(n, p);

  for (var i = 0; i < n; i++)
    for (var j = 0; j < p; j++)
      for (var k = 0; k < m; k++)
        ret.m_[i * p + j] += A[i * m + k] * B[k * p + j];
  return ret;
};


spacex.Matrix.prototype.multiply = function(rhs) {
  var n = this.rows, m = this.cols;

  if (rhs instanceof spacex.Matrix)
    rhs = rhs.m_;

  return this.multiply_(n, m, Math.floor(rhs.length / m), this.m_, rhs);
};

})();
