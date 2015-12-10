(function() {

/** @namespace */
spacex = window.spacex || {};


/**
 * A very simple spreadsheet.
 * @param {HTMLDivElement} body A visible DIV.
 * @constructor
 */
spacex.Spreadsheet = function(body) {
  this.body_ = body;
  this.pokeCell(2, 2);
  this.row = this.col = 1;
  this.focus();

  body.addEventListener('keydown', function(sheet, e) {
    var keyCode = e.keyCode & 0x7f;

    if (keyCode == 37) {  // Left
      if (!sheet.editing && (sheet.col > 1)) {
        sheet.col--;
        sheet.focus();
        e.preventDefault();
      }
    } else if (keyCode == 38) {  // Up
      if (!sheet.editing && (sheet.row > 1)) {
        sheet.row--;
        sheet.focus();
        e.preventDefault();
      }
    } else if (keyCode == 39) {  // Right
      if (!sheet.editing) {
        if (sheet.col == body.children[0].children.length - 1)
          sheet.pokeCell(1, sheet.col + 1);
        sheet.col++;
        sheet.focus();
        e.preventDefault();
      }
    } else if ((keyCode == 40) || (keyCode == 13)) {  // Down or Enter
      if (!sheet.editing) {
        if (sheet.row == body.children.length - 1)
          sheet.pokeCell(sheet.row + 1, 1);
        sheet.row++;
        sheet.focus();
        e.preventDefault();
      } else if (keyCode == 13)
        sheet.focus();
    } else if ((keyCode == 8) && (sheet.mouseRow != -1)) {  // Backspace
      if (!sheet.editing) {
        for (var i = sheet.mouseRow; i <= sheet.endRow; i++)
          for (var j = sheet.mouseCol; j <= sheet.endCol; j++)
            sheet.setCell(i, j, '');
        e.preventDefault();
      }
    } else {
      sheet.editing = true;
      body.className = 'editing';
    }
  }.bind(body, this));

  this.mouseRow = this.mouseCol = this.endRow = this.endCol = -1;

  body.addEventListener('mousedown', function(sheet, e) {
    sheet.mouseRow = Number(e.target.dataset.row);
    sheet.mouseCol = Number(e.target.dataset.col);
  }.bind(body, this));

  body.addEventListener('mouseup', function(sheet, e) {
    sheet.endRow = Number(e.target.dataset.row);
    sheet.endCol = Number(e.target.dataset.col);
    sheet.setHighlight();
  }.bind(body, this));
};


/**
 * Focus on the currently selected cell.
 */
spacex.Spreadsheet.prototype.focus = function() {
  var body = this.body_;
  this.editing = false;
  body.className = '';
  var input = body.children[this.row].children[this.col]
  input.blur();
  input.focus();
};


/**
 * Fetch the value of the given cell.
 * @param {number} row The row, with 0 being the top row.
 * @param {number} col The column, with 0 being the left edge (first cell of each row).
 * @param {boolean} preserve_formula Return the cell's formula instead of its computed value.
 */
spacex.Spreadsheet.prototype.getCell = function(row, col, preserve_formula) {
  var body = this.body_;

  if ((row >= body.children.length) || (col >= body.children[row].children.length))
    return '';
  var input = body.children[row].children[col];
  var value = preserve_formula ? input.dataset.formula : input.value;

  // Anything that isn't a "number" will turn into NaN, which is not equal to itself.
  if ((value != '') && (Number(value) == Number(value)))
    return Number(value);
  return value;
};


/**
 * Evaluate a spreadsheet formula, like '=A1+B2*4'.
 * @param {string} s The expression to evaluate.
 */
spacex.Spreadsheet.prototype.eval = function(s) {
  var parents = new spacex.Set();

  if (s[0] != '=')
    return [s, parents];

  var pieces = s.substr(1).split(/([A-Z]+)([0-9]+)/);

  for (var i = 1; i + 1 < pieces.length; i += 3) {
    var colStr = pieces[i];
    var col = 0;

    for (var j = 0; j < colStr.length; j++) {
      col *= 26;
      col += colStr.charCodeAt(j) - 64;
    }

    var rowStr = pieces[i + 1];
    var row = Number(rowStr);

    pieces[i] = this.getCell(row, col) || 0;
    pieces[i + 1] = '';
    parents.add([row, col]);
  }

  return [eval(pieces.join('')), parents];
};


/**
 * Return the spreadsheet's data in a normalized form: All number-like fields are converted to
 * numbers, empty cells at the end of each row are omitted, and empty rows at the end of the table
 * are omitted.
 * @param {boolean} preserve_formula Save a cell's formula instead of its computed value.
 */
spacex.Spreadsheet.prototype.export = function(preserve_formula) {
  var body = this.body_;
  var data = [];

  for (var lastRow = body.children.length - 1; lastRow > 0; lastRow--) {
    var row = body.children[lastRow];

    for (var j = 1; j < row.children.length; j++)
      if (this.getCell(lastRow, j, preserve_formula) != '')
        break;

    if (j < row.children.length) {
      // We broke before reaching the end of the row, so this is the last row with data.
      break;
    }
  }

  for (var i = 1; i < lastRow + 1; i++) {
    var row = body.children[i];
    var dataRow = data[i - 1] = [];

    for (var j = 1; j < row.children.length; j++) {
      value = this.getCell(i, j, preserve_formula);

      if (value != '') {
        for (var k = dataRow.length; k < j - 1; k++)
          dataRow[k] = '';
        dataRow[k] = value;
      }
    }
  }

  return data;
};


/**
 * Load the given data into the spreadsheet, overwriting anything already present.
 * @param {Array.<Array.<string|null|number>>} data The initial data, as an array of arrays of rows
 *     of strings or numbers.
 */
spacex.Spreadsheet.prototype.load = function(data) {
  // Clear the existing body.
  this.body_.textContent = '';

  for (var i = 0; i < data.length; i++) {
    var row = data[i];

    for (var j = 0; j < row.length; j++)
      this.setCell(i + 1, j + 1, row[j]);
  }
};


/**
 * Make sure the referenced cell exists, adding rows/columns as necessary.
 * @param {number} row The row, with 1 being the top row.
 * @param {number} col The column, with 1 being the left edge (first cell of each row).
 */
spacex.Spreadsheet.prototype.pokeCell = function(row, col) {
  var body = this.body_

  // The initial table looks like [['']]. If we call pokeCell(3, 2), we need to add 3 more rows
  // (extending by 3 to the 4th row for our new value), then 2 more columns to all rows (old and
  // new--the new ones needing the initial blank column added as well).
  for (var i = body.children.length; i <= row; i++)
    body.appendChild(document.createElement('div'));

  var width = Math.max(col + 1, body.children[0].children.length);

  for (var i = 0; i < body.children.length; i++) {
    var tr = body.children[i];

    for (var j = tr.children.length; j < width; j++) {
      var input = document.createElement('input');
      tr.appendChild(input);
      if ((i == 0) && (j == 0)) {
        input.disabled = true;
      } else if (i == 0) {
        input.disabled = true;
        var tmp = j;
        while (tmp) {
          input.value = String.fromCharCode(65 + ((tmp - 1) % 26)) + input.value;
          tmp = (tmp - 1) / 26 >> 0;
        }
      } else if (j == 0) {
        input.disabled = true;
        input.value = i;
      } else {
        input.dataset.children = input.dataset.parents = '[]';
        input.dataset.formula = '';
        input.dataset.row = i;
        input.dataset.col = j;
        input.addEventListener('blur', function(sheet, row, col, e) {
          sheet.setCell(row, col, this.dataset.formula);
        }.bind(input, this, i, j));
        input.addEventListener('change', function(sheet, row, col, e) {
          this.dataset.formula = this.value;
        }.bind(input, this, i, j));
        input.addEventListener('click', function(sheet, e) {
          sheet.editing = true;
          body.className = 'editing';
        }.bind(input, this));
        input.addEventListener('focus', function(sheet, row, col, e) {
          sheet.mouseRow = sheet.endRow = sheet.row = row;
          sheet.mouseCol = sheet.endCol = sheet.col = col;
          sheet.setHighlight();
          this.value = this.dataset.formula;
          this.setSelectionRange(0, this.value.length);
        }.bind(input, this, i, j));
      }
    }
  }

  return body.children[row].children[col];
};


/**
 * Set the referenced cell to the given value, adding rows/columns as necessary.
 * @param {number} row The row, with 1 being the top row.
 * @param {number} col The column, with 1 being the left edge (first cell of each row).
 * @param {string|null|number} value The new value for the cell.
 */
spacex.Spreadsheet.prototype.setCell = function(row, col, value) {
  if ((value === null) || (value === undefined))
    value = '';
  var input = this.pokeCell(row, col);
  var parents = new spacex.Set(input.dataset.parents);
  for (var parent of parents) {
    var parentRow = parent[0], parentCol = parent[1];
    var parentInput = this.pokeCell(parentRow, parentCol);
    var children = new spacex.Set(parentInput.dataset.children);
    children.delete([row, col]);
    parentInput.dataset.children = children;
  }
  input.dataset.formula = value;
  var tmp = this.eval(value);
  input.value = tmp[0];
  input.dataset.parents = tmp[1];
  for (var parent of tmp[1]) {
    var parentRow = parent[0], parentCol = parent[1];
    var parentInput = this.pokeCell(parentRow, parentCol);
    var children = new spacex.Set(parentInput.dataset.children);
    children.add([row, col]);
    parentInput.dataset.children = children;
  }
  var children = new spacex.Set(input.dataset.children);
  for (var child of children) {
    var childRow = child[0], childCol = child[1];
    var childInput = this.pokeCell(childRow, childCol);
    this.setCell(childRow, childCol, childInput.dataset.formula);
  }
};


/**
 * Mark all cells from mouseRow, mouseCol through endRow, endCol as being selected.
 */
spacex.Spreadsheet.prototype.setHighlight = function() {
  var body = this.body_;

  if (this.mouseRow == -1) {
    this.mouseRow = this.endRow;
    this.mouseCol = this.endCol;
  }

  if (this.mouseRow > this.endRow) {
    var tmp = this.mouseRow;
    this.mouseRow = this.endRow;
    this.endRow = tmp;
  }
  if (this.mouseCol > this.endCol) {
    var tmp = this.mouseCol;
    this.mouseCol = this.endCol;
    this.endCol = tmp;
  }

  for (var i = 1; i < body.children.length; i++)
    body.children[i].children[0].className = (i >= this.mouseRow) && (i <= this.endRow) ? 'active' : '';

  for (var j = 1; j < body.children[0].children.length; j++)
    body.children[0].children[j].className = (j >= this.mouseCol) && (j <= this.endCol) ? 'active' : '';

  for (var i = 1; i < body.children.length; i++) {
    var row = body.children[i];

    for (var j = 1; j < row.children.length; j++)
      row.children[j].className = (
          (i >= this.mouseRow) && (i <= this.endRow) && (j >= this.mouseCol) && (j <= this.endCol) ? 'active' : '');
  }
};

})();
