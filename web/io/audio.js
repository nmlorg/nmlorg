/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
nmlorg.io.audio = nmlorg.io.audio || {};


nmlorg.io.audio.defaultContext = function() {
  if (!nmlorg.io.audio.defaultContext_)
    nmlorg.io.audio.defaultContext_ = new AudioContext();
  return nmlorg.io.audio.defaultContext_;
};


nmlorg.io.audio.Sound = function(src, context) {
  this.context = context || nmlorg.io.audio.defaultContext();

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


nmlorg.io.audio.Sound.prototype.makeSource = function(output) {
  var source = this.context.createBufferSource();

  source.buffer = this.buffer;
  if (output)
    source.connect(output);

  return source;
};


nmlorg.io.audio.Sound.prototype.play = function(delay) {
  if (!this.buffer)
    return;

  var source = this.makeSource(this.context.destination);

  source.start(delay || 0);
  return source;
};


})();
