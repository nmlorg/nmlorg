(function() {

/** @namespace */
spacex = window.spacex || {};


/**
 * A model of the vehicle's location above the Earth.
 * @param {spacex.Vehicle} vehicle The vehicle to render.
 * @constructor
 */
spacex.Globe = function(vehicle) {
  this.vehicle_ = vehicle;
  this.div_ = document.createElement('div');
  this.div_.className = 'globe';
};


/**
 * Add the model's viewport to the document.
 * @param {HTMLElement} parent An element reachable via document.body.
 */
spacex.Globe.prototype.attach = function(parent, x, y) {
  parent.appendChild(this.div_);
  this.div_.style.left = (x || 0) + 'vw';
  this.div_.style.top = (y || 0) + 'vw';
  var subDiv = document.createElement('div');
  this.div_.appendChild(subDiv);
  this.earth_ = WE.map(subDiv);
  this.earth_.setView([46.8011, 8.2266], 2.35);
  WE.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
  }).addTo(this.earth_);
  return this;
};


/**
 * @param {number} dt The amount of time to advance, in seconds.
 */
spacex.Globe.prototype.draw = function(dt) {
  var lat = this.vehicle_.y / 110575;
  var lon = this.vehicle_.x / 111320 / Math.cos(lat * Math.PI / 180);

  this.earth_.setCenter([lat, lon]);

  return this;
};

})();
