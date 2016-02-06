(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


window.addEventListener('load', function(e) {
  var grid = new nmlorg.Grid(20, 10).attach(document.body);
  var img = document.createElement('img');
  img.addEventListener('load', function(e) {
    var sheet = new nmlorg.Sheet(img, 32, 32);
    var grass = sheet.getTile(10, 20);
    var trash = sheet.getTile(26, 27);

    grid.setBackground(grass);
    grid.setForeground(1, 1, trash);
    grid.setForeground(2, 1, trash, trash);
    grid.setForeground(3, 1, trash, trash, trash);
    grid.setForeground(2, 2, trash);
    grid.setForeground(2, 3, trash);
    grid.draw();
  });
  img.src = 'hyptosis_tile-art-batch-1.png';
});

})();
