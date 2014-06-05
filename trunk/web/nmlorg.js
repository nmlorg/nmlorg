/**
 * @fileoverview Utility functions, including the module loader (nmlorg.require).
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
nmlorg = window.nmlorg || {};


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
 * nmlorg.provide('first.second.third') ensures window.first.second.third exists, creating any steps in 
 * the path as necessary. Right now, this does not define a JsDoc namespace, so modules should continue 
 * defining their [annotated] namespaces manually.
 */
nmlorg.provide = function(namespace) {
  var parts = namespace.split('.');
  var container = window;

  for (var i = 0; i < parts.length; i++) {
    if (!(parts[i] in container))
      container[parts[i]] = {};
    container = container[parts[i]];
  }
};


/**
 * Return <code>deg</code> radians in degrees.
 * @param {number} deg
 * @return {number}
 */
nmlorg.radToDeg = function(rad) {
  return 180 * rad / Math.PI;
};


/**
 * nmlorg.require('first.second.third') checks whether window.first.second.third exists, and if not 
 * loads "first/second/third.js" into the DOM. If the namespace path begins with 'nmlorg.', the full 
 * path is checked under window, but the nmlorg/ is stripped from the path. The module 'mat4' is loaded 
 * from glMatrix.js.
 * @param {string} namespace A namespace path in the form first.second.third.
 */
nmlorg.require = function(namespace) {
  var parts = namespace.split('.');
  var container = window;
  var path = [];

  for (var i = 0; i < parts.length; i++) {
    if (!(parts[i] in container))
      break;
    container = container[parts[i]];
  }
  if (i == parts.length)
    return container;

  nmlorg.provide(namespace);

  var src;

  if (namespace == 'mat4') {
    src = 'third_party/glMatrix-0.9.5.min.js';
  } else {
    // For now, hack "nmlorg." out:
    if (parts[0] == 'nmlorg')
      parts = parts.slice(1);

    src = parts.join('/') + '.js';
  }

  document.write('<script src="/' + src + '"></script>');
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
