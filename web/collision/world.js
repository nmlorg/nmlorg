/**
 * @fileoverview Routines related to managing collisions inside a 3D world.
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
nmlorg.collision.world = nmlorg.collision.world || {};


/** @constructor */
nmlorg.collision.world.World = function() {
  this.objects = [];
};


/**
 * @param {nmlorg.physics.Object} physicalObject
 * @param {nmlorg.collision.detect.Shape} shape
 * @param {nmlorg.collision.response.Material} material
 * @param {number} [mass]
 */
nmlorg.collision.world.World.prototype.addObject = function(physicalObject, shape, material, mass) {
  if (mass === undefined)
    mass = 1;
  this.objects.push([physicalObject, shape, material, mass]);
};


/**
 * Find the next set of colliding objects.
 * @param {number} timeStep Only detect collisions that will occur within this amount of time.
 */
nmlorg.collision.world.World.prototype.getNextCollision = function(timeStep) {
  var collisionGroups = {};

  for (var i = 0; i < this.objects.length; i++) {
    var obj1 = this.objects[i][0];
    var shape1 = this.objects[i][1];
    var material1 = this.objects[i][2];

    for (var j = i + 1; j < this.objects.length; j++) {
      var obj2 = this.objects[j][0];
      var shape2 = this.objects[j][1];
      var material2 = this.objects[j][2];
      var collisionTime = shape1.timeToCollision(obj1, obj2, shape2);

      if ((collisionTime >= 0) && (collisionTime < timeStep)) {
        collisionGroups = {};
        timeStep = collisionTime;
      }

      if (collisionTime == timeStep) {
        if (!(i in collisionGroups))
          collisionGroups[i] = [i];
        collisionGroups[j] = collisionGroups[i];
        collisionGroups[i].push(j);
      }
    }
  }

  var ret = [];

  for (var i in collisionGroups)
    if (i == collisionGroups[i][0])
      ret.push(collisionGroups[i]);

  return [timeStep, ret];
};


/**
 * Update all objects' velocities and positions, resolving any collisions that occur.
 * @param {number} timeStep The amount of time (in seconds) that has passed since the last compound.
 * @see nmlorg.physics.Object#compound
 */
nmlorg.collision.world.World.prototype.compound = function(timeStep) {
  while (timeStep > 0) {
    var ret = this.getNextCollision(timeStep);
    var subStep = ret[0];
    var collisionGroups = ret[1];

    if (subStep < timeStep)
      console.log('Handling substep ' + subStep + '.');

    for (var i = 0; i < this.objects.length; i++) {
      var obj = this.objects[i][0];

      // TODO(nmlorg): nmlorg.collision.detect.Sphere#timeToCollision assumes acceleration is constant through 
      // the time slice, but nmlorg.physics.Object#compound accurately applies force end times, so if 
      // there are fixed-duration forces in use this logic will have predicted a collision slightly 
      // before or slightly after it has occurred.
      obj.compound(subStep);
    }

    for (var i = 0; i < collisionGroups.length; i++) {
      var collisionGroup = collisionGroups[i];
      // TODO(nmlorg): Right now we can build collision groups of 3 or more
      // objects, but the current collision handlers can only handle two
      // objects at once. This should be good enough for a while, but should
      // eventually be revisited.
      if (collisionGroup.length > 2)
        console.log('Unable to handle more than two simultaneously colliding objects.');
      var obj1 = this.objects[collisionGroup[0]][0];
      var shape1 = this.objects[collisionGroup[0]][1];
      var material1 = this.objects[collisionGroup[0]][2];
      var obj2 = this.objects[collisionGroup[1]][0];
      var shape2 = this.objects[collisionGroup[1]][1];
      var material2 = this.objects[collisionGroup[1]][2];

      material1.handleCollision(obj1, obj2, material2);
    }

    timeStep -= subStep;
  }
};


})();
