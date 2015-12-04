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
 * Return the spreadsheet's data in a normalized form: All number-like fields are converted to
 * numbers, empty cells at the end of each row are omitted, and empty rows at the end of the table
 * are omitted.
 */
spacex.Spreadsheet.prototype.export = function() {
  var body = this.body_;
  var data = [];

  // The actual last row (and column) is always entirely empty, so we start at length - 2.
  for (var lastRow = body.rows.length - 2; lastRow >= 0; lastRow--) {
    var row = body.rows[lastRow];

    for (var j = 0; j < row.cells.length - 1; j++)
      if (row.cells[j].firstChild.value != '')
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
      value = row.cells[j].firstChild.value;

      if (value != '') {
        // Anything that isn't a "number" will turn into NaN, which is not equal to itself.
        if (Number(value) == Number(value))
          value = Number(value);
        data[i][j] = value;
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
      input.addEventListener('change', function(sheet, row, col, e) {
        sheet.setCell(row, col, this.value);
      }.bind(input, this, i, j));
      input.addEventListener('focus', function(sheet, row, col, e) {
        sheet.row = row;
        sheet.col = col;
        this.setSelectionRange(0, this.value.length);
      }.bind(input, this, i, j));
    }
  }

  if ((value === null) || (value === undefined))
    value = '';
  body.rows[row].cells[col].firstChild.value = value;
};

})();
