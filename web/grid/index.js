window.addEventListener('load', function(e) {
  /** @namespace */
  var nmlorg = window['nmlorg'] = window['nmlorg'] || {};

  var grid = new nmlorg.Grid(20, 10).attach(document.body);
  var img = document.createElement('img');
  img.addEventListener('load', function(e) {
    var grass = new nmlorg.Tile(img, 10 * 32, 20 * 32, 32, 32);
    var trash = new nmlorg.Tile(img, 26 * 32, 27 * 32, 32, 32);

    grid.setBackground(grass);
    grid.setForeground(1, 1, trash);
    grid.setForeground(2, 1, trash);
    grid.setForeground(3, 1, trash);
    grid.setForeground(2, 2, trash);
    grid.setForeground(2, 3, trash);
    grid.draw();
  });
  img.src = 'hyptosis_tile-art-batch-1.png';
});
