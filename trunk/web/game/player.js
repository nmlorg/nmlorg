/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg.require('nmlorg.game.mob');
nmlorg.require('nmlorg.io.gamepad');
nmlorg.require('nmlorg.io.keyboard');
nmlorg.require('nmlorg.io.orient');


/** @namespace */
nmlorg.game.player = nmlorg.game.player || {};


nmlorg.game.player.Player = function(initial, sideScroll) {
  this.keyboard = new nmlorg.io.keyboard.Listener(true);
  this.orient = new nmlorg.io.orient.Listener();
  this.mob = new nmlorg.game.mob.Mobile(initial);
  this.sideScroll = !!sideScroll;
};
nmlorg.game.player.Player.prototype.viewMode = 0;
nmlorg.game.player.Player.prototype.eyeAngle = 0;
nmlorg.game.player.Player.prototype.fovAngle = 45;


nmlorg.game.player.Player.prototype.eachFrame = function(timeStep) {
  var gamepad = nmlorg.io.gamepad.getFirst();

  if (this.keyboard['1'])
    this.viewMode = 0;
  else if (this.keyboard['2'])
    this.viewMode = 1;
  else if (this.keyboard['3'])
    this.viewMode = 2;

  if (this.keyboard.Q) {
    this.eyeAngle += timeStep * 45;
    if (this.eyeAngle > 90)
      this.eyeAngle = 90;
  }

  if (this.keyboard.Z) {
    this.eyeAngle -= timeStep * 45;
    if (this.eyeAngle < -90)
      this.eyeAngle = -90;
  }

  if (this.keyboard[';']) {
    this.fovAngle -= timeStep * 45;
    if (this.fovAngle < 1)
      this.fovAngle = 1;
  }

  if (this.keyboard['=']) {
    this.fovAngle += timeStep * 45;
    if (this.fovAngle > 170)
      this.fovAngle = 170;
  }

  var walk = 0, slide = 0, turn = 0;
  var left = this.keyboard.Left || this.keyboard.A || (this.orient.y < -10) || gamepad.Left;
  var right = this.keyboard.Right || this.keyboard.D || (this.orient.y > 10) || gamepad.Right;
  var up = this.keyboard.Up || this.keyboard.W || (this.orient.x < -10) || gamepad.Up;
  var down = this.keyboard.Down || this.keyboard.S || (this.orient.x > 10) || gamepad.Down;

  if (this.sideScroll) {
    if (this.mob.pos.z) {
    } else if (up && !down) {
      if (left && !right)
        this.mob.direction = 90 + 45;
      else if (right && !left)
        this.mob.direction = 45;
      else
        this.mob.direction = 90;
      walk = 1;
    } else if (down && !up) {
      if (left && !right)
        this.mob.direction = 180 + 45;
      else if (right && !left)
        this.mob.direction = 360 - 45;
      else
        this.mob.direction = 180 + 90;
      walk = 1;
    } else if (left && !right) {
      this.mob.direction = 180;
      walk = 1;
    } else if (right && !left) {
      this.mob.direction = 0;
      walk = 1;
    }
  } else {
    if (left)
      turn++;

    if (right)
      turn--;

    if (up) {
      walk++;
      if (this.eyeAngle != 0)
        this.eyeAngle -= timeStep * this.eyeAngle / 2;
      if (this.fovAngle != 45)
        this.fovAngle -= timeStep * (this.fovAngle - 45) / 10;
    }

    if (down) {
      walk--;
      if (this.eyeAngle != 0)
        this.eyeAngle -= timeStep * this.eyeAngle / 3;
      if (this.fovAngle != 45)
        this.fovAngle -= timeStep * (this.fovAngle - 45) / 15;
    }

    if (this.keyboard['<'])
      slide--;

    if (this.keyboard['>'])
      slide++;
  }

  var jump = this.keyboard.Space ||
      ((this.orient.dx * this.orient.dx + this.orient.dy * this.orient.dy + this.orient.dz * this.orient.dz) > 16) ||
      gamepad.X;

  var run = this.keyboard.Shift || gamepad.A;

  this.mob.eachFrame(timeStep, walk, slide, turn, jump, run);
};


})();
