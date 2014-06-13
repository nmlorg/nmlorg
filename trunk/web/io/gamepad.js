/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
nmlorg.io.gamepad = nmlorg.io.gamepad || {};


// https://dvcs.w3.org/hg/gamepad/raw-file/default/gamepad.html#remapping
var buttonNames_ = [
    ['A', 'ex'],
    ['B', 'circle'],
    ['X', 'square'],
    ['Y', 'triangle'],
    ['LB', 'L2'],
    ['RB', 'R2'],
    ['LT', 'L1'],
    ['RT', 'R1'],
    ['Select'],
    ['Start'],
    ['L3'],
    ['R3'],
    ['Up'],
    ['Down'],
    ['Left'],
    ['Right'],
    ['Power'],
];


/** @constructor */
nmlorg.io.gamepad.Gamepad = function(navGamepad) {
  for (var i = 0; i < buttonNames_.length; i++) {
    var pressed = (i < navGamepad.buttons.length) && navGamepad.buttons[i].pressed;

    for (var j = 0; j < buttonNames_[i].length; j++)
      this[buttonNames_[i][j]] = pressed;
  }

  this.leftStickMag = Math.sqrt(navGamepad.axes[0] * navGamepad.axes[0] +
                                navGamepad.axes[1] * navGamepad.axes[1]);
  this.leftStick = Math.atan2(navGamepad.axes[0], -navGamepad.axes[1]) / Math.PI;

  this.rightStickMag = Math.sqrt(navGamepad.axes[2] * navGamepad.axes[2] +
                                 navGamepad.axes[3] * navGamepad.axes[3]);
  this.rightStick = Math.atan2(navGamepad.axes[2], -navGamepad.axes[3]) / Math.PI;
};


/**
 * Return an arbitrary Gamepad's state.
 * @return {nmlorg.io.gamepad.Gamepad}
 */
nmlorg.io.gamepad.getFirst = function() {
  if (nmlorg.io.supported.gamepad) {
    var gamepads = navigator.getGamepads();

    for (var i = 0; i < gamepads.length; i++) {
      var gamepad = gamepads[i];

      if (gamepad)
        return new nmlorg.io.gamepad.Gamepad(gamepad);
    }
  }

  return {
      'leftStickMag': NaN,
      'leftStick': NaN,
      'rightStickMag': NaN,
      'rightStick': NaN,
  };
};


})();
