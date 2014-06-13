/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

/** @namespace */
nmlorg.io = nmlorg.io || {};


nmlorg.io.supported = {
    'audio': !!window.AudioContext,
    'gamepad': !!navigator.getGamepads,
    'keyboard': true,
    'orient': ('ondeviceorientation' in window) && ('ondevicemotion' in window),
    'touch': 'ontouchstart' in document,
};


})();
