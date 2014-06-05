/**
 * @fileoverview Quick proof-of-concept object animator for objects bouncing off the walls of a box.
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
nmlorg.springbounce = nmlorg.springbounce || {};


var deflectionPlanes = [
    [0, -200],
    [0, 200],
    [1, 0],
    //[1, 200],
    [2, -150],
    [2, 50],
];


nmlorg.springbounce.animateShape = function(obj, timeStep) {
  var origPos = [obj.position[0], obj.position[1], obj.position[2]];
  var origVel = [obj.velocity[0], obj.velocity[1], obj.velocity[2]];

  obj.compound(timeStep);

  for (var i = 0; i < deflectionPlanes.length; i++) {
    var dim = deflectionPlanes[i][0];
    var positionAtImpact = deflectionPlanes[i][1];

    if (((origPos[dim] < positionAtImpact) && (obj.position[dim] < positionAtImpact)) ||
        ((origPos[dim] > positionAtImpact) && (obj.position[dim] > positionAtImpact)))
      continue;

    // The following assumes linear acceleration throughout the timeslice.
    // pos        vel
    // 5   orig   -100              95  200
    // 4          -115              96  220
    // 3          -130              97  240
    // 2          -145              98  260
    // 1          -160              99  280
    // 0   impact -175             100  300
    // -1         -190             101  320
    // -2  obj.   -205             102  340

    var dropBeforeImpact = origPos[dim] - positionAtImpact;
    // 5 - 0 = 5                   95 - 100 = -5
    var totalDrop = origPos[dim] - obj.position[dim];
    // 5 - -2 = 7                  95 - 102 = -7
    var totalAccel = obj.velocity[dim] - origVel[dim];
    // -205 - -100 = -105          340 - 200 = 140
    var velocityAtImpact = origVel[dim] + dropBeforeImpact * totalAccel / totalDrop;
    // -100 + 5 * -105 / 7 = -175  200 + -5 * 140 / -7 = 300
    var reflectedVelocityAtImpact = -velocityAtImpact;
    // 175                         -300
    var accelAfterImpact = obj.velocity[dim] - velocityAtImpact;
    // -205 - -175 = -30           340 - 300 = 40
    var velocityAfterImpact = reflectedVelocityAtImpact + accelAfterImpact;
    // 175 + -30 = 145             -300 + 40 = -260
    var timeOfImpact = dropBeforeImpact * timeStep / totalDrop;
    // 5 * .14 / 7 = .1            -5 * .14 / -7 = .1
    var timeAfterImpact = timeStep - timeOfImpact;
    // .14 - .1 = .04              .14 - .1 = .04
    var positionAfterImpact = positionAtImpact + velocityAfterImpact * timeAfterImpact;
    // 0 + 145 * .04 = 5.8         100 + -260 * .04 = 89.6

    if (((origPos[dim] < positionAtImpact) && (positionAfterImpact[dim] > positionAtImpact)) ||
        ((origPos[dim] > positionAtImpact) && (positionAfterImpact[dim] < positionAtImpact)))
      positionAfterImpact = positionAtImpact;

    obj.velocity[dim] = velocityAfterImpact;
    obj.position[dim] = positionAfterImpact;
  }
}


})();
