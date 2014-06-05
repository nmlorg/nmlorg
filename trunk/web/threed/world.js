/**
 * @fileoverview A 3D world, tracking the positions of objects and managing multiple viewing canvases.
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg.require('mat4');


/** @namespace */
nmlorg.threed.world = nmlorg.threed.world || {};


/**
 * A collection of objects and canvases ({@link nmlorg.gl.Canvas}). When a shape is added to a world, 
 * its geometry, color, etc. information (as vertex buffers) is added to each canvas. When the world is 
 * rendered, each object is rendered to each canvas.
 * @constructor
 * @param {Array.<nmlorg.gl.Canvas>} canvases A list of canvases to render to.
 */
nmlorg.threed.world.World = function(canvases) {
  this.canvases = canvases || [];
  this.shapes = [];
  this.timings = [];
  this.loop_ = this.loop_.bind(this);
};


/**
 * Register a {@link nmlorg.threed.shape.Shape} with this world. This is optional; 
 * {@link nmlorg.threed.world.World#addObject} will call this if needed.
 * @param {nmlorg.threed.shape.Shape} shape The shape to register.
 * @return {nmlorg.threed.shape.Shape}
 */
nmlorg.threed.world.World.prototype.addShape = function(shape) {
  var canvasShapes = [];
  var canvases;
  var args = Array.prototype.slice.call(arguments);

  if ((shape instanceof Array) && (shape[0] instanceof nmlorg.gl.Canvas)) {
    canvases = args.shift();
    shape = args[0];
  } else
    canvases = this.canvases;

  if (!(shape instanceof nmlorg.threed.shape.Shape))
    shape = nmlorg.createArgs(nmlorg.threed.shape.Shape, args);

  console.log('Adding shape ' + shape + ' to ' + canvases.length + ' canvases.');

  for (var i = 0; i < canvases.length; i++) {
    var canvas = canvases[i];

    canvasShapes.push(canvas.makeShape(shape));
  }

  this.shapes.push([shape, [], canvasShapes]);
  return shape;
};


/**
 * Combine a {@link nmlorg.threed.shape.Shape} with a {@link nmlorg.threed.world.PositionObject} to create an object 
 * in a 3D {@link nmlorg.threed.world.World}. If no {@link nmlorg.threed.world.PositionObject} is provided, one is 
 * created (at the origin). The {@link nmlorg.threed.world.PositionObject} is returned.
 * @param {nmlorg.threed.shape.Shape} shape The geometry, etc. of this world object.
 * @param {nmlorg.threed.world.PositionObject} [positionObj] The 3D location of the object in this world.
 * @return {nmlorg.threed.world.PositionObject} The position object for this world object.
 */
nmlorg.threed.world.World.prototype.addObject = function(shape, positionObj) {
  if (!(positionObj instanceof nmlorg.threed.world.PositionObject)) {
    var extraArgs = Array.prototype.slice.call(arguments, 1);

    positionObj = nmlorg.createArgs(nmlorg.threed.world.PositionObject, extraArgs);
  }

  for (var i = 0; i < this.shapes.length; i++)
    if (this.shapes[i][0] == shape)
      break;
  if (i == this.shapes.length)
    this.addShape(shape);
  this.shapes[i][1].push(positionObj);

  return positionObj;
};


/**
 * Call all of the world's objects' <code>animate</code> functions with the given timeStep, then render 
 * them to all of the world's canvases.
 * @param {number} [timeStep] The amount of time (in seconds) since the previous draw. If not provided, 
 *     or if it is greater than .1, .1 is used.
 */
nmlorg.threed.world.World.prototype.draw = function(timeStep) {
  if ((timeStep === undefined) || (timeStep > .1))
    timeStep = .1;

  for (var i = 0; i < this.canvases.length; i++)
    this.canvases[i].reset();

  if (this.eachFrame)
    this.eachFrame(timeStep);

  for (var i = 0; i < this.shapes.length; i++) {
    var worldObjects = this.shapes[i][1];

    if (!worldObjects.length)
      continue;

    for (var j = 0; j < worldObjects.length; j++) {
      var positionObj = worldObjects[j];

      if (positionObj.animate)
        positionObj.animate(timeStep);
    }

    var canvasShapes = this.shapes[i][2];

    for (var j = 0; j < canvasShapes.length; j++) {
      var canvasShape = canvasShapes[j];

      canvasShape.preload();

      for (k = 0; k < worldObjects.length; k++) {
        var positionObj = worldObjects[k];

        canvasShape.drawPreloaded(positionObj.position);
      }
    }
  }
};


if (!window.requestAnimationFrame) {
  requestAnimationFrame = mozRequestAnimationFrame;
}


nmlorg.threed.world.World.prototype.loop_ = function(elapsed) {
  if (!this.running)
    return;

  elapsed /= 1000;
  var timeStep;

  if (this.timings.length) {
    timeStep = elapsed - this.timings[this.timings.length - 1];
    this.fps = this.timings.length / (elapsed - this.timings[0]);
  } else
    timeStep = this.fps = 0;

  if (this.fpsSpan)
    this.fpsSpan.textContent = nmlorg.getInt(this.fps);

  this.timings.push(elapsed);
  while (this.timings.length > 30)
    this.timings.shift();

  this.draw(timeStep);

  if (this.running) 
    requestAnimationFrame(this.loop_);
};


/**
 * Begin animating the world repeatedly using the browser's 
 * <a href="https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame">requestAnimationFrame</a>.
 */
nmlorg.threed.world.World.prototype.start = function() {
  if (!this.running) {
    this.running = true;
    requestAnimationFrame(this.loop_);
  }
};


/**
 * Stop animating the world.
 */
nmlorg.threed.world.World.prototype.stop = function() {
  this.running = false;
};


/**
 * Add a pause button and the world's current FPS to the screen.
 * @param {HTMLElement} [container] The element to hang the controls from. If not provided, 
 *     document.body is used.
 */
nmlorg.threed.world.World.prototype.addControls = function(container) {
  if (container === undefined)
    container = document.body;

  var pausebutton = document.createElement('button');

  container.appendChild(document.createElement('br'));
  container.appendChild(pausebutton);
  pausebutton.textContent = 'Pause';
  pausebutton.onclick = function() {
    if (this.running) {
      this.stop();
      pausebutton.textContent = 'Run';
    } else {
      this.start();
      pausebutton.textContent = 'Pause';
    }
  }.bind(this);

  this.fpsSpan = document.createElement('span');

  container.appendChild(document.createTextNode('FPS: '));
  container.appendChild(this.fpsSpan);
};


/**
 * The location and orientation of a {@link nmlorg.threed.shape.Shape} inside a {@link nmlorg.threed.world.World}. If 
 * the first argument is an Array, it is used as the object's initial location. If any argument is a 
 * function, it is is bound to the current object and assigned to <code>this.animate</code>. Most 
 * commonly, position objects are created implicitly using {@link nmlorg.threed.world.World#addObject}.
 * @param {Array.<number, number, number>} [location] The object's initial location
 * @param {function(number)} [animate] The function to call once per animation frame to update the 
 *     object's location and orientation.
 * @param {...Object} var_args Arguments bound to the animate function.
 * @constructor
 */
nmlorg.threed.world.PositionObject = function() {
  var args = Array.prototype.slice.call(arguments);

  this.position = mat4.create();
  mat4.identity(this.position);
  while (args.length) {
    if (args[0] instanceof Array) {
      this.translate.apply(this, args.shift());
    } else if (args[0] instanceof Function) {
      var func = args[0];

      args[0] = this;
      this.animate = func.bind.apply(func, args);
      break;
    } else
      throw 'Unknown argument type (' + args + ').';
  }
};


/**
 * Move the object from its current location along the vector [x, y, z].
 * @param {number} x The x component.
 * @param {number} y The x component.
 * @param {number} z The x component.
 */
nmlorg.threed.world.PositionObject.prototype.translate = function(x, y, z) {
  mat4.translate(this.position, [x, y, z]);
};


/**
 * Rotate the object rad radians about an axis running through the origin and the point [x, y, z].
 * @param {number} rad The angle in radians.
 * @param {number} x The x component.
 * @param {number} y The y component.
 * @param {number} z The z component.
 */
nmlorg.threed.world.PositionObject.prototype.rotate = function(rad, x, y, z) {
  mat4.rotate(this.position, rad, [x, y, z]);
};


/**
 * Reset the object's orientation and move it to [x, y, z].
 * @param {number} x The x coordinate.
 * @param {number} y The y coordinate.
 * @param {number} z The z coordinate.
 */
nmlorg.threed.world.PositionObject.prototype.setPosition = function(x, y, z) {
  mat4.identity(this.position);
  this.translate(x, y, z);
};


})();
