(function() {

/** @namespace */
spacex = window.spacex || {};


/** @namespace */
spacex.model = spacex.model || {};


spacex.model.drawVehicle = function(ctx, camera) {
  ctx.fillStyle = 'rgba(0, 255, 0, .5)';
  camera.drawPath(ctx, [
      [-100, 0, -50],
      [100, 0, -50],
      [100, 0, -400],
      [-100, 0, -400],
  ]);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, .5)';
  camera.drawPath(ctx, [
      [-400, 50, -50],
      [400, 50, -50],
      [400, -50, -50],
      [-400, -50, -50],
  ]);
  ctx.fill();

  camera.drawPath(ctx, [
      [-400, 50, 50],
      [400, 50, 50],
      [400, -50, 50],
      [-400, -50, 50],
  ]);
  ctx.fill();

  camera.drawPath(ctx, [
      [-400, 50, -50],
      [400, 50, -50],
      [400, 50, 50],
      [-400, 50, 50],
  ]);
  ctx.fill();

  camera.drawPath(ctx, [
      [-400, -50, -50],
      [400, -50, -50],
      [400, -50, 50],
      [-400, -50, 50],
  ]);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 0, 0, .5)';
  camera.drawPath(ctx, [
      [-100, 0, 50],
      [100, 0, 50],
      [100, 0, 400],
      [-100, 0, 400],
  ]);
  ctx.fill();
};

})();
