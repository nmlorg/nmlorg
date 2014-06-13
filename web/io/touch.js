/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
nmlorg.io.touch = nmlorg.io.touch || {};


/**
 * The current state of all active "touches" on the screen.
 * @constructor
 */
nmlorg.io.touch.Listener = function(parent) {
  if (!parent)
    parent = document.body;

  parent.addEventListener('touchstart', this.handleTouchMove_.bind(this));
  parent.addEventListener('touchend', this.handleTouchEnd_.bind(this));
  parent.addEventListener('touchcancel', this.handleTouchEnd_.bind(this));
  parent.addEventListener('touchleave', this.handleTouchEnd_.bind(this));
  parent.addEventListener('touchmove', this.handleTouchMove_.bind(this));
};


nmlorg.io.touch.Listener.prototype.handleTouchMove_ = function(ev) {
  var touches = ev.changedTouches;

  for (var i = 0; i < touches.length; i++) {
    var touch = touches[i];

    if (!this[touch.identifier])
      this[touch.identifier] = {'x0': touch.pageX, 'y0': touch.pageY};
    this[touch.identifier]['x'] = touch.pageX;
    this[touch.identifier]['y'] = touch.pageY;
  }

  ev.preventDefault();
};


nmlorg.io.touch.Listener.prototype.handleTouchEnd_ = function(ev) {
  var touches = ev.changedTouches;

  for (var i = 0; i < touches.length; i++)
    delete this[touches[i].identifier];

  ev.preventDefault();
};


})();
