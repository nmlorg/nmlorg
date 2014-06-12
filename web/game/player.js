/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg.require('nmlorg.game.mob');
nmlorg.require('nmlorg.game.settings');
nmlorg.require('nmlorg.io.audio');
nmlorg.require('nmlorg.io.gamepad');
nmlorg.require('nmlorg.io.keyboard');
nmlorg.require('nmlorg.io.orient');
nmlorg.require('nmlorg.io.touch');


/** @namespace */
nmlorg.game.player = nmlorg.game.player || {};


/** @constructor */
nmlorg.game.player.Player = function(initial, settings) {
  if (!nmlorg.game.player.sounds)
    nmlorg.game.player.sounds = {
        'step': new nmlorg.io.audio.Sound('/third_party/503990_SOUNDDOGS__fo.mp3'),
    };

  this.keyboard = new nmlorg.io.keyboard.Listener(true);
  this.orient = new nmlorg.io.orient.Listener();
  this.touch = new nmlorg.io.touch.Listener();
  this.mob = new nmlorg.game.mob.Mobile(initial);
  this.settings = new nmlorg.game.settings.Settings();
  for (var k in settings)
    this.settings[k] = settings[k];
};


nmlorg.game.player.Player.prototype.viewMode = 0;
nmlorg.game.player.Player.prototype.eyeAngle = 0;
nmlorg.game.player.Player.prototype.fovAngle = 45;
nmlorg.game.player.Player.prototype.lastStepSound = 0;


nmlorg.game.player.Player.prototype.eachFrame = function(timeStep) {
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

  var left = false, right = false, up = false, down = false, slideLeft = false, slideRight = false;
  var run = false, jump = false;

  if (this.settings.keyboard) {
    if (this.keyboard.Left || this.keyboard.A)
      left = true;
    if (this.keyboard.Right || this.keyboard.D)
      right = true;
    if (this.keyboard.Up || this.keyboard.W)
      up = true;
    if (this.keyboard.Down || this.keyboard.S)
      down = true;
    if (this.keyboard['<'])
      slideLeft = true;
    if (this.keyboard['>'])
      slideRight = true;
    if (this.keyboard.Shift)
      run = true;
    if (this.keyboard.Space)
      jump = true;
  }

  if (this.settings.deviceorientation) {
    if (this.orient.y < -10)
      left = true;
    if (this.orient.y > 10)
      right = true;
    if (this.orient.x < -10)
      up = true;
    if (this.orient.x > 10)
      down = true;
    if ((this.orient.dx * this.orient.dx +
         this.orient.dy * this.orient.dy +
         this.orient.dz * this.orient.dz) > 16)
      jump = true;
  }

  if (this.settings.touch) {
    for (var touchId in this.touch) {
      var touch = this.touch[touchId];

      if ((touch.x - touch.x0) < -30)
        left = true;
      if ((touch.x - touch.x0) > 30)
        right = true;
      if ((touch.y - touch.y0) < -30)
        up = true;
      if ((touch.y - touch.y0) > 30)
        down = true;

      break;
    }
  }

  if (this.settings.gamepad) {
    var gamepad = nmlorg.io.gamepad.getFirst();

    if (gamepad.Left || ((gamepad.rightStickMag > .2) && (gamepad.rightStick < -1 / 6)))
      left = true;
    if (gamepad.Right || ((gamepad.rightStickMag > .2) && (gamepad.rightStick > 1 / 6)))
      right = true;
    if (gamepad.Up || ((gamepad.leftStickMag > .2) && (Math.abs(gamepad.leftStick) < 2 / 6)))
      up = true;
    if (gamepad.Down || ((gamepad.leftStickMag > .2) && (Math.abs(gamepad.leftStick) > 4 / 6)))
      down = true;
    if ((gamepad.leftStickMag > .2) && (gamepad.leftStick < -1 / 6) && (gamepad.leftStick > -5 / 6))
      slideLeft = true;
    if ((gamepad.leftStickMag > .2) && (gamepad.leftStick > 1 / 6) && (gamepad.leftStick < 5 / 6))
      slideRight = true;
    if (gamepad.leftStickMag > .9)
      run = true;
    if (gamepad.A)
      jump = true;
  }

  var walk = 0, slide = 0, turn = 0;

  if (this.settings.sidescroll) {
    left = left || slideLeft;
    right = right || slideRight;

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

    if (slideLeft)
      slide--;

    if (slideRight)
      slide++;
  }

  this.mob.eachFrame(timeStep, walk, slide, turn, jump, run);

  if (this.settings.sound) {
    if (!this.mob.walkTime)
      this.lastStepSound = 0;
    else if ((this.mob.walkTime - this.lastStepSound) >= .3) {
      nmlorg.game.player.sounds.step.play();
      if ((this.mob.walkTime - this.lastStepSound) < 1)
        this.lastStepSound += .3;
      else
        this.lastStepSound = this.mob.walkTime;
    }
  }
};


})();
