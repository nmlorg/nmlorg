/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
nmlorg.game.settings = nmlorg.game.settings || {};


/** @constructor */
nmlorg.game.settings.Settings = function() {
  this.docs_ = {};
  this.add('audio', true, 'Play sound effects.');
  this.add('deviceorientation', true, "Use the device's orientation to move and jump.");
  this.add('gamepad', true, 'Use an Xbox- or PS3-style gamepad to move and jump.');
  this.add('keyboard', true, 'Use the keyboard to move and jump.');
  this.add('touch', true, 'Allow the player to move using screen touches.');
};


nmlorg.game.settings.Settings.prototype.storageBase = 'nmlorg.game.settings.';


nmlorg.game.settings.Settings.prototype.add = function(name, value, docstring) {
  var storedValue = localStorage.getItem(this.storageBase + name);

  if (storedValue)
    value = JSON.parse(storedValue);

  Object.defineProperty(this, name, {
      'enumerable': true,
      'get': function() {
        return value;
      },
      'set': function(newValue) {
        value = newValue;
        localStorage.setItem(this.storageBase + name, JSON.stringify(value));
      },
  });

  this.docs_[name] = docstring;
};


})();
