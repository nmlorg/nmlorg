(function() {

/** @namespace */
nmlorg = window.nmlorg || {};


/**
 * A very simple spreadsheet.
 * @constructor
 */
nmlorg.Spreadsheet = function() {
  var body = this.body_ = document.createElement('div');

  body.className = 'spreadsheet';
  this.pokeCell(2, 2);
  this.row = this.col = 1;

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
    }
  }.bind(body, this));

  body.addEventListener('keypress', function(sheet, e) {
    if (e.keyCode != 13)
      sheet.editing = true;
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
 * Add the spreadsheet's viewport to the document.
 * @param {HTMLElement} parent An element reachable at or from document.body.
 */
nmlorg.Spreadsheet.prototype.attach = function(parent) {
  parent.appendChild(this.body_);
  this.focus();
  return this;
};


/**
 * Decode a string like 'AB10' to [10, 28].
 * @param {string} label A string like 'AB10'.
 */
nmlorg.Spreadsheet.prototype.decodeLabel = function(label) {
  if (!label.match(/^([A-Z]+)([0-9]+)$/))
    return;

  var col = 0;

  for (var i = 0; i < RegExp.$1.length; i++) {
    col *= 26;
    col += RegExp.$1.charCodeAt(i) - 64;
  }

  var row = Number(RegExp.$2);

  return [row, col];
};


Object.defineProperty(nmlorg.Spreadsheet.prototype, 'editing', {
    'get': function() {
      return this.editing_;
    },
    'set': function(value) {
      if (this.editing_ !== value) {
        this.editing_ = value;
        if (value)
          this.body_.classList.add('editing');
        else
          this.body_.classList.remove('editing');
      }
    },
});


/**
 * Encode a number like 28 to the string 'AB'.
 * @param {number} col The column number to encode.
 */
nmlorg.Spreadsheet.prototype.encodeCol = function(col) {
  var colStr = '';
  while (col) {
    colStr = String.fromCharCode(65 + ((col - 1) % 26)) + colStr;
    col = (col - 1) / 26 >> 0;
  }
  return colStr;
};


/**
 * Encode a tuple like [10, 28] to the string 'AB10'.
 * @param {number} row The row number to encode.
 * @param {number} col The column number to encode.
 */
nmlorg.Spreadsheet.prototype.encodeLabel = function(row, col) {
  return this.encodeCol(col) + row;
};


/**
 * Evaluate a spreadsheet formula, like '=A1+B2*4'.
 * @param {string} s The expression to evaluate.
 */
nmlorg.Spreadsheet.prototype.eval = function(s) {
  var parents = new Set();

  if (s[0] != '=')
    return [s, parents];

  var pieces = s.substr(1).split(/([A-Z]+[0-9]+)/);

  for (var i = 1; i + 1 < pieces.length; i += 2) {
    var label = pieces[i];
    var address = this.decodeLabel(label);
    var row = address[0], col = address[1];

    pieces[i] = this.getCell(row, col) || 0;
    parents.add(label);
  }

  return [eval(pieces.join('')), parents];
};


/**
 * Return the spreadsheet's data in a normalized form: All number-like fields are converted to
 * numbers, empty cells at the end of each row are omitted, and empty rows at the end of the table
 * are omitted.
 * @param {boolean} preserve_formula Save a cell's formula instead of its computed value.
 */
nmlorg.Spreadsheet.prototype.export = function(preserve_formula) {
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
 * Focus on the currently selected cell.
 */
nmlorg.Spreadsheet.prototype.focus = function() {
  var body = this.body_;
  this.editing = false;
  var input = body.children[this.row].children[this.col];
  input.blur();
  input.focus();
};


/**
 * Fetch the value of the given cell.
 * @param {number} row The row, with 0 being the top row.
 * @param {number} col The column, with 0 being the left edge (first cell of each row).
 * @param {boolean} preserve_formula Return the cell's formula instead of its computed value.
 */
nmlorg.Spreadsheet.prototype.getCell = function(row, col, preserve_formula) {
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
 * Load the given data into the spreadsheet, overwriting anything already present.
 * @param {Array.<Array.<string|null|number>>} data The initial data, as an array of arrays of rows
 *     of strings or numbers.
 */
nmlorg.Spreadsheet.prototype.load = function(data) {
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
nmlorg.Spreadsheet.prototype.pokeCell = function(row, col) {
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
        input.value = this.encodeCol(j);
      } else if (j == 0) {
        input.disabled = true;
        input.value = i;
      } else {
        input.dataset.formula = input.dataset.children = input.dataset.parents = '';
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
nmlorg.Spreadsheet.prototype.setCell = function(row, col, value) {
  var label = this.encodeLabel(row, col);
  if ((value === null) || (value === undefined))
    value = '';
  var input = this.pokeCell(row, col);
  var parents = this.splitSet(input.dataset.parents);
  for (var parentLabel of parents) {
    var parent = this.decodeLabel(parentLabel);
    var parentRow = parent[0], parentCol = parent[1];
    var parentInput = this.pokeCell(parentRow, parentCol);
    var children = this.splitSet(parentInput.dataset.children);
    children.delete(label);
    parentInput.dataset.children = [...children].join(',');
  }
  input.dataset.formula = value;
  var tmp = this.eval(value);
  input.value = tmp[0];
  input.dataset.parents = [...tmp[1]].join(',');
  for (var parentLabel of tmp[1]) {
    var parent = this.decodeLabel(parentLabel);
    var parentRow = parent[0], parentCol = parent[1];
    var parentInput = this.pokeCell(parentRow, parentCol);
    var children = this.splitSet(parentInput.dataset.children);
    children.add(label);
    parentInput.dataset.children = [...children].join(',');
  }
  var children = this.splitSet(input.dataset.children);
  for (var childLabel of children) {
    var child = this.decodeLabel(childLabel);
    var childRow = child[0], childCol = child[1];
    var childInput = this.pokeCell(childRow, childCol);
    this.setCell(childRow, childCol, childInput.dataset.formula);
  }
};


/**
 * Mark all cells from mouseRow, mouseCol through endRow, endCol as being selected.
 */
nmlorg.Spreadsheet.prototype.setHighlight = function() {
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


/**
 * Split 'a,b,c' into ['a', 'b', 'c'], while splitting '' into [] (instead of ['']), and return the
 * result as a Set.
 * @param {string} s An empty or comma-delimited string.
 */
nmlorg.Spreadsheet.prototype.splitSet = function(s) {
  if (!s)
    return new Set();
  return new Set(s.split(','));
};

})();
