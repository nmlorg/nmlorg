(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


window.addEventListener('load', function(e) {
  var grid = new nmlorg.Grid(20, 10).attach(document.body);
  var img = document.createElement('img');
  img.src = 'hyptosis_tile-art-batch-1.png';
  var sheet = new nmlorg.Sheet(img, 32, 32);
  var grass = sheet.getTile(10, 20);
  var gremlin = sheet.getTile(1, 26);
  var ladder = sheet.getTile(6, 4);
  var plant = sheet.getTile(14, 15);
  var trash = sheet.getTile(26, 27);

  grid.setBackground(grass);
  grid.setForeground(1, 1, trash);
  grid.setForeground(2, 1, trash, trash);
  grid.setForeground(3, 1, trash, trash, trash);
  grid.setForeground(4, 1, trash, ladder);
  grid.setForeground(1, 2, ladder);
  grid.setForeground(2, 2, ladder, ladder);
  grid.setForeground(3, 2, ladder, ladder, ladder);
  grid.setForeground(4, 2, ladder, trash);
  grid.setForeground(1, 3, gremlin);
  grid.setForeground(2, 3, plant);

  window.requestAnimationFrame(function anim() {
    grid.draw();
    window.requestAnimationFrame(anim);
  });
});

})();
