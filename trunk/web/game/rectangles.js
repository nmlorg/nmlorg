/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg.require('nmlorg.threed.shape');


/** @namespace */
nmlorg.game.rectangles = nmlorg.game.rectangles || {};


var rectangles = {};


nmlorg.game.rectangles.getRectangle = function(width, length) {
  var k = [width, length];

  if (k in rectangles)
    return rectangles[k];

  var triangles = [];

  for (var left = -width / 2; left < width / 2; left += 5) {
    var right = Math.min(left + 5, width / 2);

    for (var top = -length / 2; top < length / 2; top += 5) {
      var bottom = Math.min(top + 5, length / 2);

      triangles.push(left, bottom, 0, (left + width / 2) / width, .2, .2, 1);
      triangles.push(left, top, 0, .2, .2, .2, 1);
      triangles.push(right, bottom, 0, .2, .2, .2, 1);

      triangles.push(left, top, 0, .2, .2, .2, 1);
      triangles.push(right, bottom, 0, .2, .2, .2, 1);
      triangles.push(right, top, 0, .2, .2, (top + length / 2) / length, 1);
    }
  }

  triangles.push(-width / 2, -length / 2, -.01, .6, .6, .6, 1);
  triangles.push(width / 2, -length / 2, -.01, .6, .6, .6, 1);
  triangles.push(-width / 2, -length / 2, -1, .2, .2, .2, 1);

  triangles.push(width / 2, -length / 2, -.01, .6, .6, .6, 1);
  triangles.push(-width / 2, -length / 2, -1, .2, .2, .2, 1);
  triangles.push(width / 2, -length / 2, -1, .2, .2, .2, 1);

  triangles.push(-width / 2, length / 2, -.01, .6, .6, .6, 1);
  triangles.push(width / 2, length / 2, -.01, .6, .6, .6, 1);
  triangles.push(-width / 2, length / 2, -1, .2, .2, .2, 1);

  triangles.push(width / 2, length / 2, -.01, .6, .6, .6, 1);
  triangles.push(-width / 2, length / 2, -1, .2, .2, .2, 1);
  triangles.push(width / 2, length / 2, -1, .2, .2, .2, 1);

  triangles.push(-width / 2, -length / 2, -.01, .6, .6, .6, 1);
  triangles.push(-width / 2, length / 2, -.01, .6, .6, .6, 1);
  triangles.push(-width / 2, -length / 2, -1, .2, .2, .2, 1);

  triangles.push(-width / 2, length / 2, -.01, .6, .6, .6, 1);
  triangles.push(-width / 2, -length / 2, -1, .2, .2, .2, 1);
  triangles.push(-width / 2, length / 2, -1, .2, .2, .2, 1);

  triangles.push(width / 2, -length / 2, -.01, .6, .6, .6, 1);
  triangles.push(width / 2, length / 2, -.01, .6, .6, .6, 1);
  triangles.push(width / 2, -length / 2, -1, .2, .2, .2, 1);

  triangles.push(width / 2, length / 2, -.01, .6, .6, .6, 1);
  triangles.push(width / 2, -length / 2, -1, .2, .2, .2, 1);
  triangles.push(width / 2, length / 2, -1, .2, .2, .2, 1);

  return rectangles[k] = new nmlorg.threed.shape.Shape(
      ['position', 'color'], 'triangles', triangles);
};


})();
