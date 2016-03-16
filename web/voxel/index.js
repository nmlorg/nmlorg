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
  var escapedDiv = document.createElement('div');
  viewportDiv.appendChild(escapedDiv);
  escapedDiv.classList.add('escaped');
  var escapedBoxDiv = document.createElement('div');
  escapedDiv.appendChild(escapedBoxDiv);
  escapedBoxDiv.classList.add('box');
  escapedBoxDiv.textContent = 'Press Esc to toggle between navigation and menu mode.';

  var camera = new nmlorg.Camera();

  function mouseMove(e) {
    camera.rotateY(-e.movementX);
    camera.rotateX(-e.movementY);
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

  var keyboard = new Set();

  document.addEventListener('keydown', function(e) {
    keyboard.add(e.keyCode);
  });

  document.addEventListener('keyup', function(e) {
    switch (e.keyCode) {
      case 27:  // Escape
        if (keyboard.has(27) && (document.pointerLockElement !== viewportDiv))
          viewportDiv.requestPointerLock();
        escapePressed = false;
        break;
    }
    keyboard.delete(e.keyCode);
  });

  var prev = 0;
  window.requestAnimationFrame(function anim(now) {
    var dt = prev && (now - prev) / 1000;
    prev = now;
    if (keyboard.has(65))  // A
      camera.translate(-1 * dt, 0, 0);
    if (keyboard.has(68))  // D
      camera.translate(1 * dt, 0, 0);
    if (keyboard.has(83))  // S
      camera.translate(0, 0, 1 * dt);
    if (keyboard.has(87))  // W
      camera.translate(0, 0, -1 * dt);
    var cameraPos = camera.getPos(0, 0, 0);
    var facingPos = camera.getPos(0, 0, -1);
    canvasDiv.innerHTML = 'Position: ' +
        JSON.stringify([Math.round(cameraPos[0] * 10) / 10, Math.round(cameraPos[1] * 10) / 10,
                        Math.round(cameraPos[2] * 10) / 10]) +
        '<br>Facing:' +
        JSON.stringify([Math.round((facingPos[0] - cameraPos[0]) * 10) / 10,
                        Math.round((facingPos[1] - cameraPos[1]) * 10) / 10,
                        Math.round((facingPos[2] - cameraPos[2]) * 10) / 10]);
    window.requestAnimationFrame(anim);
  });
});

})();
