(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


window.addEventListener('load', function(e) {
  var viewportDiv = document.createElement('div');
  document.body.appendChild(viewportDiv);
  viewportDiv.classList.add('viewport');
  var canvasDiv = document.createElement('div');
  viewportDiv.appendChild(canvasDiv);
  canvasDiv.classList.add('canvas');
  canvasDiv.textContent = 'Canvas content.';
  var escapedDiv = document.createElement('div');
  viewportDiv.appendChild(escapedDiv);
  escapedDiv.classList.add('escaped');
  var escapedBoxDiv = document.createElement('div');
  escapedDiv.appendChild(escapedBoxDiv);
  escapedBoxDiv.classList.add('box');
  escapedBoxDiv.textContent = 'Press Esc to toggle between navigation and menu mode.';

  function mouseMove(e) {
    console.log('mousemove', e.movementX, e.movementY, e);
  }

  document.addEventListener('pointerlockchange', function(e) {
    console.log('pointerlockchange:', e);
    if (document.pointerLockElement === viewportDiv) {
      escapedDiv.classList.add('hidden');
      document.addEventListener('mousemove', mouseMove);
    } else {
      escapedDiv.classList.remove('hidden');
      document.removeEventListener('mousemove', mouseMove);
    }
  });

  document.addEventListener('pointerlockerror', function(e) {
    console.log('pointerlockerror:', e);
  });

  var escapePressed = false;

  document.addEventListener('keydown', function(e) {
    console.log('keydown', e.keyCode, String.fromCodePoint(e.keyCode), e);
    switch (e.keyCode) {
      case 27:  // Escape
        escapePressed = true;
        break;
    }
  });

  document.addEventListener('keypress', function(e) {
    console.log('keypress', e.keyCode, String.fromCodePoint(e.keyCode), e);
  });

  document.addEventListener('keyup', function(e) {
    console.log('keyup', e.keyCode, String.fromCodePoint(e.keyCode), e);
    switch (e.keyCode) {
      case 27:  // Escape
        if (escapePressed && (document.pointerLockElement !== viewportDiv))
          viewportDiv.requestPointerLock();
        escapePressed = false;
        break;
    }
  });
});

})();
