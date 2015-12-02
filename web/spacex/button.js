(function() {

/** @namespace */
spacex = window.spacex || {};


/**
 * A quick control button.
 * @param {string} text The button text.
 * @constructor
 */
spacex.Button = function(text) {
  this.button_ = document.createElement('button');
  this.button_.className = 'sx-button';
  this.button_.textContent = text;
};


/**
 * Mark the button as "active", for its context-sensitive meaning.
 * @param {Boolean} active Is the button active?
 */
spacex.Button.prototype.active = function(active) {
  this.button_.style.backgroundColor = active ? 'rgba(0, 255, 0, .5)' : '';
  return this;
};


/**
 * Add the button to the document.
 * @param {HTMLElement} parent An element reachable via document.body.
 */
spacex.Button.prototype.attach = function(parent, x, y) {
  parent.appendChild(this.button_);
  this.button_.style.left = (x || 0) + 'vw';
  this.button_.style.top = (y || 0) + 'vw';
  return this;
};


/**
 * Register a click event handler for the button.
 * @param {function} handler The handler to call.
 */
spacex.Button.prototype.click = function(handler) {
  this.button_.addEventListener('click', handler);
  this.button_.style.cursor = 'pointer';
  return this;
};


/**
 * Change the button's title to the given text.
 * @param {string} text The button text.
 */
spacex.Button.prototype.title = function(text) {
  this.button_.textContent = text;
};


/**
 * A set of buttons.
 * @constructor
 */
spacex.ButtonBar = function(horiz) {
  this.horiz = !!horiz;
  this.div_ = document.createElement('div');
  this.div_.className = 'button-bar button-bar-' + (this.horiz ? 'horiz' : 'vert');
};


/**
 * Add a new button to the button bar.
 * @param {string} text The button text.
 */
spacex.ButtonBar.prototype.add = function(text) {
  return new spacex.Button(text).attach(this.div_);
};


/**
 * Add the button bar to the document.
 * @param {HTMLElement} parent An element reachable via document.body.
 */
spacex.ButtonBar.prototype.attach = function(parent, x, y) {
  parent.appendChild(this.div_);
  this.div_.style.left = (x || 0) + 'vw';
  this.div_.style.top = (y || 0) + 'vw';
  return this;
};

})();
