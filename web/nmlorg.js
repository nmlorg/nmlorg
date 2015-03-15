/**
 * @fileoverview Utility functions, including the module loader (nmlorg.require).
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
nmlorg = window.nmlorg || {};


nmlorg.baseUrl_ = '/';


var scripts = document.getElementsByTagName('script');

for (var i = scripts.length - 1; i >= 0; i--) {
  var match = scripts[i].src.match(/^(.*[/])nmlorg[.]js$/);

  if (match) {
    nmlorg.baseUrl_ = match[1];
    break;
  }
}


/**
 * Take the non-complex cube root of a.
 * @param {number} a
 * @return {number} A number that, cubed, equals a.
 */
nmlorg.cbrt = function(a) {
  if (a < 0)
    return -Math.pow(-a, 1 / 3);
  return Math.pow(a, 1 / 3);
};


/**
 * nmlorg.create(a, b, c) = new a(b, c)
 * @param {Object} typeObj The constructor of the object to create.
 * @param {...Object} var_args Arguments to pass into the constructor.
 * @return {typeObj}
 */
nmlorg.create = function(typeObj) {
  var extraArgs = Array.prototype.slice.call(arguments, 1);

  return nmlorg.createArgs(typeObj, extraArgs);
};


/**
 * nmlorg.createArgs(a, [b, c]) = new a(b, c)
 * @param {Object} typeObj The constructor of the object to create.
 * @param {Array} args Arguments to pass into the constructor.
 * @return {typeObj}
 */
nmlorg.createArgs = function(typeObj, args) {
  var obj = Object.create(typeObj.prototype);

  typeObj.apply(obj, args);
  return obj;
};


/**
 * Return <code>deg</code> degrees in radians.
 * @param {number} deg
 * @return {number}
 */
nmlorg.degToRad = function(deg) {
  return Math.PI * deg / 180;
};


/**
 * Return the integer component of v.
 * @param {number} v
 * @return {number}
 */
nmlorg.getInt = function(v) {
  if (v < 0)
    return Math.ceil(v);
  return Math.floor(v);
};


/**
 * Return whether v has no fractional component.
 * @param {number} v
 * @return {number}
 */
nmlorg.isInt = function(v) {
  return Math.floor(v) == v;
};


/**
 * Fetch a JSON response from <code>url</code>.
 * @param {string} url The URL to fetch.
 */
nmlorg.json = function(url, callback) {
  var req = new XMLHttpRequest();

  if (callback) {
    req.open('GET', url, true);
    req.addEventListener('load', function(ev) {
      if (req.status == 200)
        callback(JSON.parse(req.responseText));
    });
  } else
    req.open('GET', url, false);

  req.send();
  if (req.status == 200)
    return JSON.parse(req.responseText);
};


/**
 * Return <code>deg</code> radians in degrees.
 * @param {number} deg
 * @return {number}
 */
nmlorg.radToDeg = function(rad) {
  return 180 * rad / Math.PI;
};


nmlorg.thirdParty_ = {
    'mat4': 'third_party/glMatrix-0.9.5.min.js',
};


/**
 * nmlorg.require('first.second.third') checks whether window.first.second.third exists, and if not 
 * loads "first/second/third.js" into the DOM. If the namespace path begins with 'nmlorg.', the full 
 * path is checked under window, but the nmlorg/ is stripped from the path. The module 'mat4' is loaded 
 * from glMatrix.js.
 * @param {string} namespace A namespace path in the form first.second.third.
 */
nmlorg.require = function(namespace) {
  if (namespace in nmlorg.thirdParty_) {
    if (!(namespace in window)) {
      window[namespace] = {};
      nmlorg.loadScript_(nmlorg.thirdParty_[namespace]);
    }
    return window[namespace];
  }

  var parts = namespace.split('.');

  if (parts[0] != 'nmlorg') {
    alert('Unable to load "' + namespace + '".');
    return;
  }

  var container = nmlorg;

  for (var i = 1; i < parts.length; i++) {
    if (!(parts[i] in container)) {
      container[parts[i]] = {};
      nmlorg.loadScript_(parts.slice(1, i + 1).join('/') + '.js');
    }
    container = container[parts[i]];
  }
  return container;
};


nmlorg.loadScript_ = function(src) {
  document.write('<script src="' + nmlorg.baseUrl_ + src + '"></script>');
};


nmlorg.subclass = function(parent, constructor) {
  function install(parent) {
    if (!(parent instanceof Function)) {
      var pieces = parent.split('.');
      var parent = window;

      for (var i = 0; i < pieces.length; i++)
        parent = parent[pieces[i]];
    }

    var origPrototype = constructor.prototype;
    var keys = Object.keys(origPrototype);

    constructor.prototype = Object.create(parent.prototype);
    for (var i = 0; i < keys.length; i++)
      constructor.prototype[keys[i]] = origPrototype[keys[i]];
  }

  if (parent instanceof Function)
    install(parent)
  else
    window.addEventListener('load', install.bind(null, parent));

  return constructor;
};


})();
