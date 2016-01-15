(function() {

/** @namespace */
var nmlorg = window.nmlorg = window.nmlorg || {};


/**
 * @constructor
 */
nmlorg.Grid = function() {
  var body = this.body_ = document.createElement('div');

  body.className = 'grid';
  this.getCell(20, 20);
  this.row = this.col = 0;

  body.addEventListener('mousedown', function(grid, e) {
    grid.row = Number(e.target.dataset.row);
    grid.col = Number(e.target.dataset.col);
    grid.focus();
  }.bind(body, this));

  body.addEventListener('keydown', function(grid, e) {
    switch (e.keyCode) {
      case 37:  // Left
        if (grid.col > 0)
          grid.col--;
        grid.focus();
        e.preventDefault();
        break;
      case 38:  // Up
        if (grid.row > 0)
          grid.row--;
        grid.focus();
        e.preventDefault();
        break;
      case 39:  // Right
        grid.col++;
        grid.focus();
        e.preventDefault();
        break;
      case 40:  // Down
        grid.row++;
        grid.focus();
        e.preventDefault();
        break;
    }
  }.bind(body, this));
};


/**
 * Add the grid's viewport to the document.
 * @param {HTMLElement} parent An element reachable at or from document.body.
 */
nmlorg.Grid.prototype.attach = function(parent) {
  parent.appendChild(this.body_);
  this.focus();
  return this;
};


/**
 * Focus on the currently selected cell.
 */
nmlorg.Grid.prototype.focus = function() {
  var body = this.body_;
  var cell = this.getCell(this.row, this.col);

  for (var i = 0; i < body.children.length; i++) {
    var row = body.children[i];

    for (var j = 0; j < row.children.length; j++)
      row.children[j].className = '';
  }

  cell.className = 'active';
  cell.focus();
};


/**
 * Return the referenced cell's HTMLButtonElement, adding rows/columns as necessary.
 * @param {number} row The row, with 1 being the top row.
 * @param {number} col The column, with 1 being the left edge (first cell of each row).
 */
nmlorg.Grid.prototype.getCell = function(row, col) {
  var body = this.body_;

  // The initial table looks like [['']]. If we call getCell(3, 2), we need to add 3 more rows
  // (extending by 3 to the 4th row for our new value), then 2 more columns to all rows (old and
  // new--the new ones needing the initial blank column added as well).
  for (var i = body.children.length; i <= row; i++)
    body.appendChild(document.createElement('div'));

  var width = Math.max(col + 1, body.children[0].children.length);

  for (var i = 0; i < body.children.length; i++) {
    var tr = body.children[i];

    for (var j = tr.children.length; j < width; j++) {
      var cell = document.createElement('button');
      tr.appendChild(cell);
      cell.dataset.row = i;
      cell.dataset.col = j;
    }
  }

  return body.children[row].children[col];
};

})();
