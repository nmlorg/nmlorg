/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {


/** @namespace */
nmlorg.game.platforms = nmlorg.game.platforms || {};


/** @constructor */
nmlorg.game.platforms.PlatformSet = function() {};
nmlorg.subclass(Array, nmlorg.game.platforms.PlatformSet);


nmlorg.game.platforms.PlatformSet.prototype.add = function(width, height) {
  var platform = new nmlorg.game.platforms.Platform(width, height);

  this.push(platform);
  return platform;
};


nmlorg.game.platforms.PlatformSet.prototype.autoConnect = function() {
  for (var i = 0; i < this.length; i++) {
    var leftPlatform = this[i];
    var leftPoints = [
        leftPlatform.getRearLeft(0, 0, 0),
        leftPlatform.getRearRight(0, 0, 0),
        leftPlatform.getFrontRight(0, 0, 0),
        leftPlatform.getFrontLeft(0, 0, 0),
    ];

    for (var j = 0; j < this.length; j++) {
      if (i == j)
        continue;

      var rightPlatform = this[j];

      for (var k = 0; k < leftPoints.length; k++) {
        var leftPoint = leftPoints[k];
        var rightPoint = rightPlatform.localize(leftPoint);

        if (rightPoint.inside()) {
          nmlorg.game.platforms.connect(leftPoint, rightPoint);
          break;
        }
      }
    }
  }
};


/**
 * A position relative to the origin of a Platform.
 * @constructor
 */
nmlorg.game.platforms.Position = function(platform, x, y, z) {
  this.platform = platform;
  this.x = x;
  this.y = y;
  this.z = z;
};


nmlorg.game.platforms.Position.prototype.copy = function(x, y, z) {
  var ret = new nmlorg.game.platforms.Position(
      this.platform, this.x, this.y, this.z + z);

  ret.moveBy(x, y);
  return ret;
};


nmlorg.game.platforms.Position.prototype.inside = function() {
  var platform = this.platform;

  return ((this.x >= platform.left) && (this.x <= platform.right) &&
          (this.y >= platform.front) && (this.y <= platform.rear));
};


nmlorg.game.platforms.Position.prototype.intercept = function(dx, dy) {
  var platform = this.platform;
  var x2 = this.x + dx;
  var y2 = this.y + dy;
  var intercept = 1;

  if (x2 < platform.left)
    // this.x + intercept * dx =  platform.left
    //          intercept * dx =  platform.left - this.x
    //          intercept      = (platform.left - this.x) / dx
    intercept = (platform.left - this.x) / dx;
  else if (x2 > platform.right)
    intercept = (platform.right - this.x) / dx;

  if (y2 < platform.front)
    intercept = Math.min(intercept, (platform.front - this.y) / dy);
  else if (y2 > platform.rear)
    intercept = Math.min(intercept, (platform.rear - this.y) / dy);

  return intercept;
};


nmlorg.game.platforms.Position.prototype.moveBy = function(dx, dy) {
  var intercept = this.intercept(dx, dy);

  this.x += intercept * dx;
  this.y += intercept * dy;

  if (intercept == 1) {
    // We completed the entire forward motion.

    if (this.z == 0)
      // We didn't change levels, so we must not have changed platforms.
      return this;

    // We changed levels, so we may have actually stepped up.
    var position = this.getPositionsUnder()[0];

    if (this.platform != position.platform) {
      this.platform.eventTarget_.dispatchEvent(new CustomEvent('exit', {'position': this}));
      this.platform = position.platform;
      this.x = position.x;
      this.y = position.y;
      this.z = position.z;
      this.platform.eventTarget_.dispatchEvent(new CustomEvent('enter', {'position': this}));
    }
    return this;
  }

  // We hit the edge of this platform (and did not complete the forward motion).
  dx *= (1 - intercept);
  dy *= (1 - intercept);

  var positions = this.getPositionsUnder();

  for (var i = 0; i < positions.length; i++) {
    var position = positions[i];
    var intercept = position.intercept(dx, dy);

    if (!intercept)
      continue;

    this.platform.eventTarget_.dispatchEvent(new CustomEvent('exit', {'position': this}));
    this.platform = position.platform;
    this.x = position.x + intercept * dx;
    this.y = position.y + intercept * dy;
    this.z = position.z;
    this.platform.eventTarget_.dispatchEvent(new CustomEvent('enter', {'position': this}));
    if (intercept == 1) {
      // We have now completed the forward motion.
      return this;
    }
    return this.moveBy((1 - intercept) * dx, (1 - intercept) * dy, 0);
  }

  // We're at the edge of the whole world (no platforms adjacent to this 
  // platform extend out in the direction of motion). Go ahead and burn off 
  // however much of the forward motion is left (hugging the edge).
  for (var i = 0; i < positions.length; i++) {
    var position = positions[i];
    var xintercept = position.intercept(dx, 0);

    if (xintercept) {
      if (this.platform != position.platform) {
        this.platform.eventTarget_.dispatchEvent(new CustomEvent('exit', {'position': this}));
        this.platform = position.platform;
        this.platform.eventTarget_.dispatchEvent(new CustomEvent('enter', {'position': this}));
      }
      this.x = position.x + dx * xintercept;
      this.y = position.y;
      this.z = position.z;
      return this;
    }

    var yintercept = position.intercept(0, dy);

    if (yintercept) {
      if (this.platform != position.platform) {
        this.platform.eventTarget_.dispatchEvent(new CustomEvent('exit', {'position': this}));
        this.platform = position.platform;
        this.platform.eventTarget_.dispatchEvent(new CustomEvent('enter', {'position': this}));
      }
      this.x = position.x;
      this.y = position.y + dy * yintercept;
      this.z = position.z;
      return this;
    }
  }

  // We are in a corner of the world.
  return this;
};


nmlorg.game.platforms.Position.prototype.getPositionsUnder = function() {
  var connections = this.platform.connections;
  var positions = [];

  if ((this.z >= 0) && this.inside())
    positions.push(this);

  for (var i = 0; i < connections.length; i++) {
    var localpos = connections[i][0];
    var adjpos = connections[i][1];
    var relpos = adjpos.platform.getOrigin(
        adjpos.x - (localpos.x - this.x),
        adjpos.y - (localpos.y - this.y),
        adjpos.z - (localpos.z - this.z));

    if ((relpos.z >= 0) && relpos.inside())
      positions.push(relpos);
  }

  return positions.sort(function(a, b) { return a.z - b.z; });
};


/**
 * A region of ~uniform height where all points are considered fungible.
 * @constructor
 */
nmlorg.game.platforms.Platform = function(width, height) {
  this.left = -width / 2;
  this.right = width / 2;
  this.front = -height / 2;
  this.rear = height / 2;
  this.connections = [];
  this.eventTarget_ = document.createElement('span');
};


nmlorg.game.platforms.Platform.prototype.addEventListener = function() {
  return this.eventTarget_.addEventListener.apply(this.eventTarget_, arguments);
};


nmlorg.game.platforms.Platform.prototype.dispatchEvent = function() {
  return this.eventTarget_.dispatchEvent.apply(this.eventTarget_, arguments);
};


nmlorg.game.platforms.Platform.prototype.removeEventListener = function() {
  return this.eventTarget_.removeEventListener.apply(this.eventTarget_, arguments);
};


function Set() {};
nmlorg.subclass(Array, Set);


Set.prototype.add = function(ent) {
  for (var i = 0; i < this.length; i++)
    if (this[i] === ent)
      return false;
  this.push(ent);
  return true;
};


/**
 * Breadth-first search from this to platform via this.connections. The result
 * is an array of connections (pairs of Positions), such that
 * result[0][0].platform is this and result[-1][1].platform is platform.
 */
nmlorg.game.platforms.Platform.prototype.pathTo = function(platform) {
  var paths = [];
  var seen = new Set();

  for (var i = 0; i < this.connections.length; i++) {
    var connection = this.connections[i];

    if (seen.add(connection[1].platform))
      paths.push([connection]);
  }

  while (paths.length) {
    var tailPath = paths.shift();
    var tailPlatform = tailPath[tailPath.length - 1][1].platform;

    if (tailPlatform == platform)
      return tailPath;

    for (var i = 0; i < tailPlatform.connections.length; i++) {
      var connection = tailPlatform.connections[i];

      if (seen.add(connection[1].platform))
        paths.push(tailPath.concat([connection]));
    }
  }
};


/**
 * Return position's location relative to this (which may be outside of this' 
 * actual bounds).
 */
nmlorg.game.platforms.Platform.prototype.localize = function(position) {
  if (position.platform == this)
    return position;

  var path = position.platform.pathTo(this);

  if (!path)
    return;

  for (var i = 0; i < path.length; i++) {
    var localpos = path[i][0];
    var adjpos = path[i][1];

    position = adjpos.platform.getOrigin(
        adjpos.x - (localpos.x - position.x),
        adjpos.y - (localpos.y - position.y),
        adjpos.z - (localpos.z - position.z));
  }

  return position;
};


nmlorg.game.platforms.Platform.prototype.getOrigin = function(x, y, z) {
  return new nmlorg.game.platforms.Position(this, x, y, z);
};


// This API distinction allows the origin to be changed to be the front-right 
// corner, the left edge, etc. without affecting any existing code. When dealing 
// with raw x, y, z values, use getOrigin; when you actually mean to refer to 
// the center of the object, use getCenter.
nmlorg.game.platforms.Platform.prototype.getCenter = (
    nmlorg.game.platforms.Platform.prototype.getOrigin);


nmlorg.game.platforms.Platform.prototype.getLeft = function(x, y, z) {
  return this.getOrigin(this.left + x, y, z);
};


nmlorg.game.platforms.Platform.prototype.getRearLeft = function(x, y, z) {
  return this.getOrigin(this.left + x, this.rear + y, z);
};


nmlorg.game.platforms.Platform.prototype.getRear = function(x, y, z) {
  return this.getOrigin(x, this.rear + y, z);
};


nmlorg.game.platforms.Platform.prototype.getRearRight = function(x, y, z) {
  return this.getOrigin(this.right + x, this.rear + y, z);
};


nmlorg.game.platforms.Platform.prototype.getRight = function(x, y, z) {
  return this.getOrigin(this.right + x, y, z);
};


nmlorg.game.platforms.Platform.prototype.getFrontRight = function(x, y, z) {
  return this.getOrigin(this.right + x, this.front + y, z);
};


nmlorg.game.platforms.Platform.prototype.getFront = function(x, y, z) {
  return this.getOrigin(x, this.front + y, z);
};


nmlorg.game.platforms.Platform.prototype.getFrontLeft = function(x, y, z) {
  return this.getOrigin(this.left + x, this.front + y, z);
};


/** Mark two or more platform-relative positions as colocated. */
nmlorg.game.platforms.connect = function(var_args) {
  for (var i = 0; i < arguments.length; i++) {
    var position = arguments[i];
    var platform = position.platform;

    for (var j = 0; j < arguments.length; j++) {
      var adjpos = arguments[j];

      if (i != j)
        platform.connections.push([position, adjpos]);
    }
  }
};


})();
