/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
nmlorg.io.gamepad = nmlorg.io.gamepad || {};


nmlorg.io.gamepad.Manager = function() {
  this.gamepads = {};
};


nmlorg.io.gamepad.Manager.prototype.poll = function() {
  var gamepads = navigator.getGamepads();

  this.gamepads = {};

  for (var i = 0; i < gamepads.length; i++) {
    var gamepad = gamepads[i];

    if (!gamepad)
      continue;

    this.gamepads[i] = {
        'U': gamepad.buttons[3].pressed,
        'D': gamepad.buttons[0].pressed,
        'L': gamepad.buttons[2].pressed,
        'R': gamepad.buttons[1].pressed,
        'LB': gamepad.buttons[4].pressed,
        'RB': gamepad.buttons[5].pressed,
        'LT': gamepad.buttons[6].pressed,
        'RT': gamepad.buttons[7].pressed,
        'Select': gamepad.buttons[8].pressed,
        'Start': gamepad.buttons[9].pressed,
        'L3': gamepad.buttons[10].pressed,
        'R3': gamepad.buttons[11].pressed,
        'Up': gamepad.buttons[12].pressed,
        'Down': gamepad.buttons[13].pressed,
        'Left': gamepad.buttons[14].pressed,
        'Right': gamepad.buttons[15].pressed,
        'Power': gamepad.buttons[16] && gamepad.buttons[16].pressed,
    };
  }

  return this.gamepads;
};


nmlorg.io.gamepad.Manager.prototype.getFirst = function() {
  var gamepads = this.poll();

  for (var i in gamepads)
    if (gamepads[i])
      return gamepads[i];

  return {};
};



})();
