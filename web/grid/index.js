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
  var sillyTile = new nmlorg.AnimatedTile(1000, ladderTile, gremlinTile, plantTile);
  var sillyItem = new nmlorg.Item(sillyTile, {});
  sheet = new nmlorg.Sheet('tmp/BombExploding.png', 32, 64);
  var explosionTile = new nmlorg.AnimatedTile(
      1000 / 10, sheet.getTile(0, 0), sheet.getTile(1, 0), sheet.getTile(2, 0), sheet.getTile(3, 0),
      sheet.getTile(4, 0), sheet.getTile(5, 0), sheet.getTile(6, 0), sheet.getTile(7, 0),
      sheet.getTile(8, 0), sheet.getTile(9, 0), sheet.getTile(10, 0), sheet.getTile(11, 0),
      sheet.getTile(12, 0));
  var explosionItem = new nmlorg.Item(explosionTile, {});

  grid.setBackground(grassTile);
  grid.addForeground(1, 1, trashItem);
  grid.addForeground(1, 2, ladderItem);
  grid.addForeground(2, 2, ladderItem, ladderItem);
  grid.addForeground(3, 2, ladderItem, ladderItem, ladderItem);
  grid.addForeground(1, 3, ladderItem, sillyItem);
  grid.addForeground(2, 3, gremlinItem, sillyItem);
  grid.addForeground(3, 3, plantItem, sillyItem);
  grid.addForeground(4, 3, explosionItem);

  window.requestAnimationFrame(function anim() {
    grid.draw();
    window.requestAnimationFrame(anim);
  });
});

})();
