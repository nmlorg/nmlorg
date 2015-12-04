(function() {

/** @namespace */
spacex = window.spacex || {};


/**
 * A very simple spreadsheet.
 * @param {HTMLTableSectionElement} body A TBODY section within a visible TABLE.
 * @constructor
 */
spacex.Spreadsheet = function(body) {
  this.body_ = body;
  this.setCell(0, 0, '');
  this.row = this.col = 0;

  body.addEventListener('keydown', function(sheet, e) {
    var keyCode = e.keyCode & 0x7f;

    if (keyCode == 37) {  // Left
      if (sheet.col > 0) {
        sheet.col--;
        body.rows[sheet.row].cells[sheet.col].firstChild.focus();
      }
    } else if (keyCode == 38) {  // Up
      if (sheet.row > 0) {
        sheet.row--;
        body.rows[sheet.row].cells[sheet.col].firstChild.focus();
      }
    } else if (keyCode == 39) {  // Right
      if (sheet.col == body.rows[0].cells.length - 1)
        sheet.setCell(0, sheet.col + 1, '')
      sheet.col++;
      body.rows[sheet.row].cells[sheet.col].firstChild.focus();
    } else if ((keyCode == 40) || (keyCode == 13)) {  // Down or Enter
      if (sheet.row == body.rows.length - 1)
        sheet.setCell(sheet.row + 1, 0, '')
      sheet.row++;
      body.rows[sheet.row].cells[sheet.col].firstChild.focus();
    } else
      return;
    e.preventDefault();
  }.bind(body, this));
};


/**
 * Fetch the value of the given cell.
 * @param {number} row The row, with 0 being the top row.
 * @param {number} col The column, with 0 being the left edge (first cell of each row).
 * @param {boolean} preserve_formula Return the cell's formula instead of its computed value.
 */
spacex.Spreadsheet.prototype.getCell = function(row, col, preserve_formula) {
  var body = this.body_;

  if ((row >= body.rows.length) && (col >= body.rows[row].cells.length))
    return '';
  var input = body.rows[row].cells[col].firstChild;
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
  if (s[0] != '=')
    return s;

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

    pieces[i] = this.getCell(row - 1, col - 1) || 0;
    pieces[i + 1] = '';
  }

  return eval(pieces.join(''));
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

  // The actual last row (and column) is always entirely empty, so we start at length - 2.
  for (var lastRow = body.rows.length - 2; lastRow >= 0; lastRow--) {
    var row = body.rows[lastRow];

    for (var j = 0; j < row.cells.length - 1; j++)
      if (this.getCell(lastRow, j, preserve_formula) != '')
        break;

    if (j < row.cells.length - 1) {
      // We broke before reaching the end of the row, so this is the last row with data.
      break;
    }
  }

  for (var i = 0; i < lastRow + 1; i++) {
    var row = body.rows[i];

    data[i] = [];
    for (var j = 0; j < row.cells.length; j++) {
      value = this.getCell(i, j, preserve_formula);

      if (value != '')
        data[i][j] = value;
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
      this.setCell(i, j, row[j]);
  }
};


/**
 * Set the referenced cell to the given value, adding rows/columns as necessary.
 * @param {number} row The row, with 0 being the top row.
 * @param {number} col The column, with 0 being the left edge (first cell of each row).
 * @param {string|null|number} value The new value for the cell.
 */
spacex.Spreadsheet.prototype.setCell = function(row, col, value) {
  var body = this.body_

  // The initial table looks like [['']]. If we call setCell(3, 2, 'hi'), we need to add 4 more rows
  // (extending by 3 to the 4th row for our new value, then 1 more for a blank row), then 3 more
  // columns to all rows (old and new--the new ones needing the initial blank column added as well).
  for (var i = body.rows.length; i <= row + 1; i++)
    body.insertRow();

  var width = Math.max(col + 2, body.rows[0].cells.length);

  for (var i = 0; i < body.rows.length; i++) {
    var tr = body.rows[i];

    for (var j = tr.cells.length; j < width; j++) {
      var td = tr.insertCell();
      var input = document.createElement('input');
      td.appendChild(input);
      input.dataset.formula = '';
      input.addEventListener('blur', function(sheet, e) {
        this.value = sheet.eval(this.dataset.formula);
      }.bind(input, this));
      input.addEventListener('change', function(sheet, row, col, e) {
        this.dataset.formula = this.value;
      }.bind(input, this, i, j));
      input.addEventListener('focus', function(sheet, row, col, e) {
        sheet.row = row;
        sheet.col = col;
        this.value = this.dataset.formula;
        this.setSelectionRange(0, this.value.length);
      }.bind(input, this, i, j));
    }
  }

  if ((value === null) || (value === undefined))
    value = '';
  var input = body.rows[row].cells[col].firstChild;
  input.dataset.formula = value;
  input.value = this.eval(value);
};

})();
