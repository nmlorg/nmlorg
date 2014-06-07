/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg.require('nmlorg.game.platforms');
nmlorg.require('nmlorg.game.rectangles');


/** @namespace */
nmlorg.game.builder = nmlorg.game.builder || {};


nmlorg.game.builder.Builder = function(platforms) {
  this.pset = new nmlorg.game.platforms.PlatformSet();
  this.platforms = [];

  if (platforms)
    for (var i = 0; i < platforms.length; i++)
      this.add.apply(this, platforms[i]);
};


nmlorg.game.builder.Builder.prototype.right = 0;
nmlorg.game.builder.Builder.prototype.near = 0;
nmlorg.game.builder.Builder.prototype.far = 0;
nmlorg.game.builder.Builder.prototype.defaultThickness = 5;


nmlorg.game.builder.Builder.prototype.add = function(
    left, width, height, thickness, yOff) {
  if (!thickness)
    thickness = this.defaultThickness;
  if (!yOff)
    yOff = 0;

  this.right = Math.max(this.right, left + width);
  this.near = Math.min(this.near, yOff - thickness / 2);
  this.far = Math.max(this.far, yOff + thickness / 2);

  var platform = this.pset.add(width, thickness);

  if (!this.first)
    this.first = platform;

  this.platforms.push(platform.getLeft(-left, -yOff, -height));

  return platform;
};


nmlorg.game.builder.Builder.prototype.pyramid = function(
    steps, bLeft, bWidth, bHeight, bThickness, tWidth, tHeight, 
    tThickness, yOff) {
  var tLeft = bLeft + bWidth / 2 - tWidth / 2;
  var stepLeft = (tLeft - bLeft) / (steps - 1);
  var stepWidth = (tWidth - bWidth) / (steps - 1);
  var stepHeight = (tHeight - bHeight) / (steps - 1);
  var stepThickness = (tThickness - bThickness) / (steps - 1);

  for (var i = 0; i < steps; i++) {
    var left = bLeft + stepLeft * i;
    var width = bWidth + stepWidth * i;
    var height = bHeight + stepHeight * i;
    var thickness = bThickness + stepThickness * i;

    this.add(left, width, height, thickness, yOff);
  }
};


nmlorg.game.builder.Builder.prototype.build = function(world) {
  //var ground = this.pset.add(this.right, this.far - this.near).getLeft(0, 0, 0);
  var ground = this.pset.add(this.right, this.defaultThickness).getLeft(0, 0, 0);

  for (var i = 0; i < this.platforms.length; i++)
    nmlorg.game.platforms.connect(ground, this.platforms[i]);

  nmlorg.game.rectangles.renderInto(world, this.pset, this.first);

  this.pset.autoConnect();
  return this.first;
};


})();
