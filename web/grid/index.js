(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


window.addEventListener('load', function(e) {
  var grid = new nmlorg.Grid(20, 10).attach(document.body);
  var sheet = new nmlorg.Sheet('tmp/hyptosis_tile-art-batch-1.png', 32, 32);
  var grassTile = sheet.getTile(10, 20);
  var gremlinTile = sheet.getTile(1, 26);
  var gremlinItem = new nmlorg.Item(gremlinTile, {});
  var ladderTile = sheet.getTile(6, 4);
  var ladderItem = new nmlorg.Item(ladderTile, {});
  var plantTile = sheet.getTile(14, 15);
  var plantItem = new nmlorg.Item(plantTile, {});
  var trashTile = sheet.getTile(26, 27);
  var trashItem = new nmlorg.Item(trashTile, {stackable: false});
  sheet = new nmlorg.Sheet('tmp/BombExploding.png', 32, 64);
  var explosionTile = new nmlorg.AnimatedTile(
      1000 / 10, sheet.getTile(0, 0), sheet.getTile(1, 0), sheet.getTile(2, 0), sheet.getTile(3, 0),
      sheet.getTile(4, 0), sheet.getTile(5, 0), sheet.getTile(6, 0), sheet.getTile(7, 0),
      sheet.getTile(8, 0), sheet.getTile(9, 0), sheet.getTile(10, 0), sheet.getTile(11, 0),
      sheet.getTile(12, 0));
  var explosionItem = new nmlorg.Item(explosionTile, {});

  grid.setBackground(grassTile);
  grid.addForeground(1, 1, trashItem);
  grid.addForeground(2, 1, ladderItem);
  grid.addForeground(3, 1, ladderItem, ladderItem);
  grid.addForeground(4, 1, ladderItem, gremlinItem);
  grid.addForeground(5, 1, ladderItem, gremlinItem, plantItem);
  grid.addForeground(6, 1, ladderItem, gremlinItem, plantItem, explosionItem);

  window.requestAnimationFrame(function anim() {
    grid.draw();
    window.requestAnimationFrame(anim);
  });
});

})();
