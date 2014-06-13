/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
nmlorg.io.audio = nmlorg.io.audio || {};


/**
 * Get a shared AudioContext.
 * @return {AudioContext}
 */
nmlorg.io.audio.defaultContext = function() {
  if (nmlorg.io.audio.defaultContext_ === undefined) {
    if (!nmlorg.io.supported.audio) {
      nmlorg.io.audio.defaultContext_ = null;
      console.log('The Web Audio API is apparently not supported in this browser.');
    } else
      nmlorg.io.audio.defaultContext_ = new AudioContext();
  }
  return nmlorg.io.audio.defaultContext_;
};


/**
 * A single playable sound.
 * @param {string} src The [potentially relative] URL to a sound file.
 * @param {AudioContext} [context] The AudioContext to create the sound within.
 * @constructor
 */
nmlorg.io.audio.Sound = function(src, context) {
  this.context = context || nmlorg.io.audio.defaultContext();
  if (!this.context)
    return;

  var req = new XMLHttpRequest();

  req.open('GET', src);
  req.responseType = 'arraybuffer';
  req.addEventListener('load', function(ev) {
    this.context.decodeAudioData(req.response, function(buffer) {
      this.buffer = buffer;
    }.bind(this));
  }.bind(this));
  req.send();
};


nmlorg.io.audio.Sound.prototype.makeSource_ = function(output) {
  var source = this.context.createBufferSource();

  source.buffer = this.buffer;
  if (output)
    source.connect(output);

  return source;
};


/**
 * Play the sound after an optional delay. (Multiple, overlapping invocations are fine.)
 * @param {number} [delay] Wait this many ms before playing the sound.
 */
nmlorg.io.audio.Sound.prototype.play = function(delay) {
  if (!this.buffer)
    return;

  var source = this.makeSource_(this.context.destination);

  source.start(delay || 0);
  return source;
};


})();
