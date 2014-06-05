/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg = window.nmlorg || {};


/** @namespace */
nmlorg.game.mob = nmlorg.game.mob || {};


nmlorg.game.mob.Mobile = function(initial) {
  this.pos = initial;
  this.state = {};
};


nmlorg.game.mob.Mobile.prototype.direction = 0;
nmlorg.game.mob.Mobile.prototype.stepHeight = .5;
nmlorg.game.mob.Mobile.prototype.walkSpeed = 3.08;
nmlorg.game.mob.Mobile.prototype.runSpeed = 12.42;
nmlorg.game.mob.Mobile.prototype.turnSpeed = 45;
nmlorg.game.mob.Mobile.prototype.jumpVelocity = 7;
nmlorg.game.mob.Mobile.prototype.dz = 0;
nmlorg.game.mob.Mobile.prototype.maxJumps = 1;
nmlorg.game.mob.Mobile.prototype.jumps = 0;
nmlorg.game.mob.Mobile.prototype.walkTime = 0;
nmlorg.game.mob.Mobile.prototype.runTime = 0;
nmlorg.game.mob.Mobile.prototype.stamina = 1;
nmlorg.game.mob.Mobile.prototype.maxRunTime = 10;
nmlorg.game.mob.Mobile.prototype.marioMotion = false;


nmlorg.game.mob.Mobile.prototype.eachFrame = function(
    timeStep, walk, slide, turn, jump, run) {
  if (jump && (this.dz <= 0) && (this.jumps < this.maxJumps)) {
    this.jumps++;
    this.dz += this.jumpVelocity;
  }

  if (!this.pos.z || this.marioMotion) {
    this.state.walk = walk;
    this.state.slide = slide;
    this.state.turn = turn;
    this.state.run = run;
  }

  this.pos.z += this.dz * timeStep;
  if (this.pos.z <= 0)
    this.pos.z = this.dz = this.jumps = 0;
  else if (this.pos.z)
    this.dz -= 10 * timeStep;

  if ((this.state.walk || this.state.slide) && !this.pos.z)
    this.walkTime += timeStep;
  else
    this.walkTime = 0;

  if (this.state.run && (this.state.walk || this.state.slide) && !this.pos.z) {
    this.runTime += timeStep;
    this.stamina = Math.max(.1, this.stamina - timeStep / this.maxRunTime);
  } else {
    this.runTime = 0;
    this.stamina = Math.min(1, this.stamina + 2 * timeStep / this.maxRunTime);
  }

  if (this.state.turn > 0)
    this.direction += this.turnSpeed * timeStep;
  else if (this.state.turn < 0)
    this.direction -= this.turnSpeed * timeStep;

  var x = 0, y = 0;

  if (this.state.walk || this.state.slide) {
    var angle = this.direction;

    if (this.state.walk < 0)
      angle += 180;

    if (this.state.walk && this.state.slide)
      angle -= 45 * this.state.walk * this.state.slide;
    else if (this.state.slide)
      angle -= 90 * this.state.slide;

    var speed = (this.state.run ? this.runSpeed : this.walkSpeed) * this.stamina;

    x = speed * Math.cos(nmlorg.degToRad(angle));
    y = speed * Math.sin(nmlorg.degToRad(angle));
  }

  if (this.pos.z)
    this.pos.moveBy(timeStep * x, timeStep * y);
  else if (x || y) {
    this.pos.z += this.stepHeight;
    this.pos.moveBy(timeStep * x, timeStep * y);
    this.pos.z -= this.stepHeight;
    if (this.pos.z < this.stepHeight)
      this.pos.z = 0;
  }
};


})();
