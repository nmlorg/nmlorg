/**
 * @fileoverview A simple test suite, used by test*.html files.
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg.require('nmlorg.math.numbers');

/** @namespace */
nmlorg.test = nmlorg.test || {};


function slice(a, offset) {
  return Array.prototype.slice.call(a, offset);
}


/**
 * Return s % var_args.
 * @param {string} s
 * @param {...Object} var_args
 */
function interpolate(s) {
  if (typeof s != 'string')
    return interpolate.apply(this, arguments[0]);

  var args = slice(arguments, 1);
  var argNum = 0;

  function replacer(match, offset, s) {
    var type = match.substr(1, 1);
    var value = args[argNum++];

    if (type == 'i')
      return nmlorg.getInt(value);
    else if (type == 'r')
      return JSON.stringify(value);
    else
      return value;
  }

  return s.replace(/%[a-z]/g, replacer);
}


/**
 * If <code>tests</code> is provided, run all functions in <code>tests</code>. Otherwise, run all global 
 * functions with names beginning with <code>test</code>.
 * @param {Array.<function()>} [tests] An optional list of tests to run.
 */
nmlorg.test.run = function(tests) {
  if (tests === undefined) {
    tests = [];

    for (var k in window)
      if (k.search(/^test/) == 0)
        tests.push(window[k]);
  }

  new nmlorg.test.Suite(tests);
};


/**
 * During initialization, each function in <code>tests</code> is run with <code>this</code> bound to the 
 * test suite.
 * @constructor
 * @param {Array.<function()>} tests A list of tests to run.
 */
nmlorg.test.Suite = function(tests) {
  var failures = 0, passes = 0;

  this.consoleLog = console.log.bind(console);
  console.log = function() { this.log(slice(arguments).join(' ')); }.bind(this);

  this.mocks = [];

  for (var i = 0; i < tests.length; i++) {
    var test = tests[i];

    this.numChecks = 0;
    this.log('[  RUN   ] ' + test.name);
    try {
      test.call(this);
    } catch (e) {
      failures++;
      this.log('[ FAILED ] ' + test.name + ' check ' + this.numChecks + ':\n' + e.stack);
      continue;
    } finally {
      if (this.mocks.length > 0) {
        this.log('Restoring mocks.');
        for (var j = 0; j < this.mocks.length; j++) {
          var owner = this.mocks[j][0], name = this.mocks[j][1], orig = this.mocks[j][2];

          owner[name] = orig;
        }
        this.mocks.length = 0;
      }
    }
    passes++;
    this.log('[ PASSED ] %s (%i checks)', test.name, this.numChecks);
  }
  if (!failures && !passes)
    this.log('No tests found.')
  else if (!failures)
    this.log('All %i tests passed.', passes);
  else if (!passes)
    this.log('All %i tests failed.', failures);
  else
    this.log('%i tests passed, %i tests failed.', passes, failures);

  delete console.log;
}


/**
 * Print s % var_args to console.log and to the current document.
 * @param {string} s
 * @param {...Object} var_args
 */
nmlorg.test.Suite.prototype.log = function(s) {
  var div = document.createElement('pre');

  if (arguments.length > 1)
    s = interpolate(arguments);

  this.consoleLog(s);
  document.body.appendChild(div);
  div.style.margin = 0;
  div.textContent = s;
  if (s.search(/^\[ PASSED \]/) == 0)
    div.style.color = 'green';
  else if (s.search(/^\[ FAILED \]/) == 0)
    div.style.color = 'red';
};


/**
 * Replace owner[name] with replacement. After the current test finishes, the original owner[name] will 
 * be restored.
 * @param {Object} owner
 * @param {string} name
 * @param {Object} replacement
 */
nmlorg.test.Suite.prototype.mock = function(owner, name, replacement) {
  this.mocks.push([owner, name, owner[name]]);
  owner[name] = replacement;
};


/**
 * If value is false, throw an exception (with message = message % var_args).
 * @param value
 * @param {string} message
 * @param {...Object} var_args
 */
nmlorg.test.Suite.prototype.assert_ = function(value, message) {
  if (!value)
    throw new Error('Assertion failed: ' + interpolate(slice(arguments, 1)));
};


/**
 * Assert a < b.
 * @param {number} a
 * @param {number} b
 */
nmlorg.test.Suite.prototype.assertLess_ = function(a, b) {
  this.assert_(a < b, '%s < %s', a, b);
};


/**
 * Assert a == b.
 * @param a
 * @param b
 */
nmlorg.test.Suite.prototype.assertEqual_ = function(a, b) {
  if ((a instanceof Array) && (b instanceof Array))
    return this.assertArrayEqual_(a, b);
  else if ((a instanceof Object) && (b instanceof Object))
    return this.assertObjectEqual_(a, b);
  else if ((typeof a == 'number') && (typeof b == 'number'))
    return this.assertNumberReallyClose_(a, b);

  this.assert_(a == b, '%s == %s', a, b);
};


/**
 * Assert a[0] == b[0], a[1] == b[1], ...
 * @param {Array} a
 * @param {Array} b
 */
nmlorg.test.Suite.prototype.assertArrayEqual_ = function(a, b) {
  this.assertEqual_(a.length, b.length);

  for (var i = 0; i < a.length; i++)
    this.assertEqual_(a[i], b[i]);
};


/**
 * Assert a[first] == b[first], a[second] == b[second], ...
 * @param {Object} a
 * @param {Object} b
 */
nmlorg.test.Suite.prototype.assertObjectEqual_ = function(a, b) {
  this.assertEqual_(Object.keys(a), Object.keys(b));
  this.assertObjectContains_(a, b);
};


/**
 * @param {number} a
 * @param {number} b
 * @see nmlorg.math.numbers.equal
 */
nmlorg.test.reallyClose = function(a, b) {
  if ((typeof a == 'number') && (typeof b == 'number'))
    return nmlorg.math.numbers.equal(a, b);
  return a == b;
};


/**
 * @param {number} a
 * @param {number} b
 * @see nmlorg.math.numbers.equal
 */
nmlorg.test.Suite.prototype.assertNumberReallyClose_ = function(a, b) {
  if (a == b)
    return;

  this.assert_(nmlorg.math.numbers.equal(a, b), '%s == %s', a, b);
};


/**
 * Assert b contains a.
 * @param a
 * @param b
 */
nmlorg.test.Suite.prototype.assertContains_ = function(a, b) {
  if ((a instanceof Array) && (b instanceof Array))
    return this.assertArrayContains_(a, b);
  else if (b instanceof Array)
    return this.assertArrayContains_([a], b);
  else if ((a instanceof Object) && (b instanceof Object))
    return this.assertObjectContains_(a, b);

  this.assertLess_(-1, a.search(b));
};


/**
 * Assert all values in a are present in b.
 * @param {Array} a
 * @param {Array} b
 */
nmlorg.test.Suite.prototype.assertArrayContains_ = function(a, b) {
  for (var i = 0; i < a.length; i++) {
    for (var j = 0; j < b.length; j++)
      if (nmlorg.test.reallyClose(a[i], b[j]))
        break;
    this.assertLess_(j, b.length);
  }
};


/**
 * Assert all values in a are present in b.
 * @param {Object} a
 * @param {Object} b
 */
nmlorg.test.Suite.prototype.assertObjectContains_ = function(a, b) {
  for (var k in b)
    this.assertEqual_(a[k], b[k]);
};


/**
 * Assert a === b.
 * @param a
 * @param b
 */
nmlorg.test.Suite.prototype.assertIs_ = function(a, b) {
  this.assert_(a === b, '%s === %s', a, b);
};


for (var k in nmlorg.test.Suite.prototype) {
  if (k.search(/^assert.*_$/) == 0) (function() {
    var funcname = k.substr(0, k.length - 1);
    var origfunc = nmlorg.test.Suite.prototype[k];

    nmlorg.test.Suite.prototype[funcname] = function(var_args) {
      if (this.topTest)
        origfunc.apply(this, arguments);

      var strArgs = [];

      for (var i = 0; i < arguments.length; i++)
        strArgs.push(JSON.stringify(arguments[i]));
      this.topTest = funcname + '(' + strArgs.join(', ') + ')';
      this.numChecks++;

      try {
        origfunc.apply(this, arguments);
      } catch (e) {
        throw new Error(this.topTest + ': ' + e.message);
      } finally {
        this.topTest = null;
      }
    };
  })();
}


var level = 0;


function levelLog(s) {
  var s2 = [];

  for (var i = 0; i < level; i++)
    s2.push('|  ');
  s2.push(s);
  console.log(s2.join(''));
}


nmlorg.test.trace = function(f, name) {
  if (!(f instanceof Function)) {
    for (var k in f)
      f[k] = nmlorg.test.trace(f[k], name + '.' + k);
    return;
  }

  return function() {
    levelLog('|- ' + name + '(' + Array.prototype.join.call(arguments, ', ') + ')');
    level++;
    var ret = f.apply(this, arguments);
    levelLog('`- ' + JSON.stringify(ret));
    level--;
    return ret;
  };
};


})();
