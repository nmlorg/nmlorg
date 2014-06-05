/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg.require('nmlorg.threed.gl');
nmlorg.require('nmlorg.threed.world');


/** @namespace */
nmlorg.game.autocanvas = nmlorg.game.autocanvas || {};


nmlorg.game.autocanvas.createWorld = function() {
  var divs = document.getElementsByClassName('canvas');
  var canvases = [];

  for (var i = 0; i < divs.length; i++) {
    var div = divs[i];
    var style = window.getComputedStyle(div);
    var width = parseInt(style.width) - parseInt(style.borderLeftWidth) - parseInt(style.borderRightWidth);
    var height = parseInt(style.height) - parseInt(style.borderTopWidth) - parseInt(style.borderBottomWidth);
    var canvas = new nmlorg.threed.gl.Canvas(width, height);

    canvases.push(canvas);
    canvas.canvas.parentNode.removeChild(canvas.canvas);
    canvas.canvas.style.position = 'absolute';
    div.insertBefore(canvas.canvas, div.firstChild);
  }

  delete divs;

  window.addEventListener('resize', function(ev) {
    for (var i = 0; i < canvases.length; i++) {
      var canvas = canvases[i];
      var div = canvas.canvas.parentElement;
      var style = window.getComputedStyle(div);
      var width = parseInt(style.width) - parseInt(style.borderLeftWidth) - parseInt(style.borderRightWidth);
      var height = parseInt(style.height) - parseInt(style.borderTopWidth) - parseInt(style.borderBottomWidth);

      canvas.canvas.width = canvas.width = width;
      canvas.canvas.height = canvas.height = height;
      canvas.gl.viewport(0, 0, width, height);
    }
  });

  var world = new nmlorg.threed.world.World(canvases);
  var buttons = document.getElementsByClassName('action-pause');

  for (var i = 0; i < buttons.length; i++) {
    var button = buttons[i];

    button.innerHTML = '<span class="glyphicon glyphicon-pause"></span>';
    button.title = 'Pause';
    button.addEventListener('click', function(button) {
      if (world.running) {
        world.stop();
        button.innerHTML = '<span class="glyphicon glyphicon-play"></span>';
        button.title = 'Play';
      } else {
        world.start();
        button.innerHTML = '<span class="glyphicon glyphicon-pause"></span>';
        button.title = 'Pause';
      }
    }.bind(null, button));
  }

  var buttons = document.getElementsByClassName('action-reset');

  for (var i = 0; i < buttons.length; i++) {
    var button = buttons[i];

    button.innerHTML = '<span class="glyphicon glyphicon-refresh"></span>';
    button.title = 'Reset controls';
    button.addEventListener('click', function(ev) {
      window.dispatchEvent(new Event('resetcontrols'));
    });
  }

  var buttons = document.getElementsByClassName('action-fullscreen');

  if (buttons.length) {
    for (var i = 0; i < buttons.length; i++) {
      var button = buttons[i];

      button.innerHTML = '<span class="glyphicon glyphicon-fullscreen"></span>';
      button.title = 'Full screen';
      button.addEventListener('click', function(button) {
        // https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Using_full_screen_mode#Toggling_fullscreen_mode
        if (!document.fullscreenElement &&    // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {  // current working methods
          if (document.documentElement.requestFullscreen)
            document.documentElement.requestFullscreen();
          else if (document.documentElement.msRequestFullscreen)
            document.documentElement.msRequestFullscreen();
          else if (document.documentElement.mozRequestFullScreen)
            document.documentElement.mozRequestFullScreen();
          else if (document.documentElement.webkitRequestFullscreen)
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        } else {
          if (document.exitFullscreen)
            document.exitFullscreen();
          else if (document.msExitFullscreen)
            document.msExitFullscreen();
          else if (document.mozCancelFullScreen)
            document.mozCancelFullScreen();
          else if (document.webkitExitFullscreen)
            document.webkitExitFullscreen();
        }
      }.bind(null, button));
    }

    function handleFullScreenChange(ev) {
      if (!document.fullscreenElement &&    // alternative standard method
          !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        for (var i = 0; i < buttons.length; i++) {
          var button = buttons[i];

          button.innerHTML = '<span class="glyphicon glyphicon-fullscreen"></span>';
          button.title = 'Full screen';
        }
        document.dispatchEvent(new Event('restore'));
      } else {
        for (var i = 0; i < buttons.length; i++) {
          var button = buttons[i];

          button.innerHTML = '<span class="glyphicon glyphicon-resize-small"></span>';
          button.title = 'Restore';
        }
        document.dispatchEvent(new Event('maximize'));
      }
    }

    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('msfullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
  }

  return world;
};


})();
