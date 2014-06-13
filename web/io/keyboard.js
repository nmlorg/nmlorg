/**
 * @fileoverview Routines for tracking the state of the keyboard. This is primarily for allowing 
 * keyboard-based world navigation, rather than for data input.
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
nmlorg.io.keyboard = nmlorg.io.keyboard || {};


/**
 * The current state of the keyboard.
 * @constructor
 */
nmlorg.io.keyboard.Listener = function(consume) {
  this.consume_ = consume;
  document.addEventListener('keydown', this.handleKeyDown_.bind(this));
  document.addEventListener('keyup', this.handleKeyUp_.bind(this));
};


nmlorg.io.keyboard.Listener.prototype.decodeSide_ = function(ev) {
  switch (ev.location) {
    case 1:
      return 'L';
    case 2:
      return 'R';
    case 3:
      return 'Num';
    case 4:
      return 'Mobile';
    case 5:
      return 'Joystick';
    default:
      return '';
  }
};


nmlorg.io.keyboard.Listener.prototype.decodeKey_ = function(ev) {
  var keyCode = ev.keyCode & 0x7f;

  switch (keyCode) {
    case 8:
      return 'Backspace';
    case 9:
      return 'Tab';
    case 13:
      return 'Enter';
    case 16:
      return 'Shift';
    case 17:
      return 'Ctrl';
    case 18:
      return 'Alt';
    case 20:
      return 'CapsLock';
    case 27:
      return 'Esc';
    case 32:
      return 'Space';
    case 33:
      return 'PageUp';
    case 34:
      return 'PageDown';
    case 35:
      return 'End';
    case 36:
      return 'Home';
    case 37:
      return 'Left';
    case 38:
      return 'Up';
    case 39:
      return 'Right';
    case 40:
      return 'Down';
    case 46:
      return 'Del';
    default:
      return String.fromCharCode(keyCode);
  }
};


nmlorg.io.keyboard.Listener.prototype.handleKeyDown_ = function(ev) {
  var side = this.decodeSide_(ev);
  var key = this.decodeKey_(ev);

  this[side + key] = true;

  if (side) {
    if (!this[key])
      this[key] = {};
    this[key][side + key] = true;
  }

  if (this.consume_)
    ev.preventDefault();
};


nmlorg.io.keyboard.Listener.prototype.handleKeyUp_ = function(ev) {
  var side = this.decodeSide_(ev);
  var key = this.decodeKey_(ev);

  this[side + key] = false;

  if (side) {
    var num = 0;

    this[key][side + key] = false;
    for (var k in this[key])
      if (this[key][k]) {
        num++;
        break;
      }
    if (!num)
      this[key] = false;
  }

  if (this.consume_)
    ev.preventDefault();
};


})();
