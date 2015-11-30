(function() {

/** @namespace */
spacex = window.spacex || {};


/** @namespace */
spacex.model = spacex.model || {};


spacex.model.drawVehicle = function(ctx, camera) {
  ctx.fillStyle = 'rgba(0, 0, 0, .5)';
  camera.drawPath(ctx, [
      [-295, 50, -45],
      [400, 50, -45],
      [400, 50, 45],
      [-295, 50, 45],
  ]);
  ctx.fill();

  camera.drawPath(ctx, [
    [-305, 50, -45],
    [-305, 50, 45],
    [-395, 5, 0],
  ]);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, .5)';
  camera.drawPath(ctx, [
      [-295, 45, -50],
      [400, 45, -50],
      [400, -45, -50],
      [-295, -45, -50],
  ]);
  ctx.fill();

  camera.drawPath(ctx, [
      [-295, 45, 50],
      [400, 45, 50],
      [400, -45, 50],
      [-295, -45, 50],
  ]);
  ctx.fill();

  camera.drawPath(ctx, [
      [-295, -50, -45],
      [400, -50, -45],
      [400, -50, 45],
      [-295, -50, 45],
  ]);
  ctx.fill();

  camera.drawPath(ctx, [
    [-305, -50, -45],
    [-305, -50, 45],
    [-395, -5, 0],
  ]);
  ctx.fill();

  ctx.fillStyle = 'rgba(0, 255, 0, .5)';
  camera.drawPath(ctx, [
      [-100, 0, -50],
      [100, 0, -50],
      [100, 0, -400],
      [-100, 0, -400],
  ]);
  ctx.fill();

  camera.drawPath(ctx, [
    [-305, 45, -50],
    [-305, -45, -50],
    [-395, 0, -5],
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

  camera.drawPath(ctx, [
    [-305, 45, 50],
    [-305, -45, 50],
    [-395, 0, 5],
  ]);
  ctx.fill();
};

})();
