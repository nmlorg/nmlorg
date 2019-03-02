class Spreadsheet {
  constructor() {
    let body = this.body_ = document.createElement('div');

    body.className = 'spreadsheet';
    this.getInput(2, 2);
    this.row = this.col = 1;

    body.addEventListener('keydown', e => {
      if (this.editing) {
        switch (e.keyCode) {
          case 13:  // Enter
            this.row++;
            this.focus();
            e.preventDefault();
            break;
        }
      } else {
        switch (e.keyCode) {
          case 8:  // Backspace
            for (let i = this.mouseRow; i <= this.endRow; i++)
              for (let j = this.mouseCol; j <= this.endCol; j++)
                this.setCell(i, j, '');
            e.preventDefault();
            break;
          case 13:  // Enter
            this.mouseRow = this.endRow = this.row;
            this.mouseCol = this.endCol = this.col;
            this.setHighlight();
            this.editing = true;
            e.preventDefault();
            break;
          case 37:  // Left
            if (this.col > 1)
              this.col--;
            this.focus();
            e.preventDefault();
            break;
          case 38:  // Up
            if (this.row > 1)
              this.row--;
            this.focus();
            e.preventDefault();
            break;
          case 39:  // Right
            this.col++;
            this.focus();
            e.preventDefault();
            break;
          case 40:  // Down
            this.row++;
            this.focus();
            e.preventDefault();
            break;
        }
      }
    });

    body.addEventListener('keypress', e => this.editing = true);

    this.mouseRow = this.mouseCol = this.endRow = this.endCol = 1;

    body.addEventListener('mousedown', e => {
      this.row = this.mouseRow = this.endRow = Number(e.target.dataset.row);
      this.col = this.mouseCol = this.endCol = Number(e.target.dataset.col);
      if (this.row == 0) {
        this.row = this.mouseRow = 1;
        this.endRow = body.children.length - 1;
      }
      if (this.col == 0) {
        this.col = this.mouseCol = 1;
        this.endCol = body.children[0].children.length - 1;
      }
      this.focus();
      this.setHighlight();
    });

    body.addEventListener('mouseup', e => {
      this.endRow = Number(e.target.dataset.row);
      this.endCol = Number(e.target.dataset.col);
      if (this.endRow == 0) {
        this.mouseRow = 1;
        this.endRow = body.children.length - 1;
      }
      if (this.endCol == 0) {
        this.mouseCol = 1;
        this.endCol = body.children[0].children.length - 1;
      }
      this.setHighlight();
    });
  }

  /**
   * Add the spreadsheet's viewport to the document.
   * @param {HTMLElement} parent An element reachable at or from document.body.
   */
  attach(parent) {
    parent.appendChild(this.body_);
    this.focus();
    return this;
  }

  /**
   * Decode a string like 'AB10' to [10, 28].
   * @param {string} label A string like 'AB10'.
   */
  decodeLabel(label) {
    let ret = label.match(/^([A-Z]+)([0-9]+)$/);

    if (!ret)
      return;

    let col = 0;

    for (let i = 0; i < ret[1].length; i++) {
      col *= 26;
      col += ret[1].charCodeAt(i) - 64;
    }

    let row = Number(ret[2]);

    return [row, col];
  }

  get editing() {
    return this.editing_;
  }

  set editing(value) {
    value = !!value;
    if (this.editing_ != value) {
      this.editing_ = value;
      if (value)
        this.body_.classList.add('editing');
      else
        this.body_.classList.remove('editing');
    }
  }

  /**
   * Encode a number like 28 to the string 'AB'.
   * @param {number} col The column number to encode.
   */
  encodeCol(col) {
    let colStr = '';
    while (col) {
      colStr = String.fromCharCode(65 + ((col - 1) % 26)) + colStr;
      col = (col - 1) / 26 >> 0;
    }
    return colStr;
  }

  /**
   * Encode a tuple like [10, 28] to the string 'AB10'.
   * @param {number} row The row number to encode.
   * @param {number} col The column number to encode.
   */
  encodeLabel(row, col) {
    return this.encodeCol(col) + row;
  }

  /**
   * Evaluate a spreadsheet formula, like '=A1+B2*4'.
   * @param {string} s The expression to evaluate.
   */
  eval(s) {
    let parents = new Set();

    if (s[0] != '=')
      return [s, parents];

    let pieces = s.substr(1).split(/([A-Z]+[0-9]+)/);

    for (let i = 1; i + 1 < pieces.length; i += 2) {
      let label = pieces[i];
      let address = this.decodeLabel(label);
      let row = address[0], col = address[1];

      pieces[i] = this.getCell(row, col) || 0;
      parents.add(label);
    }

    return [eval(pieces.join('')), parents];
  }

  /**
   * Return the spreadsheet's data in a normalized form: All number-like fields are converted to
   * numbers, empty cells at the end of each row are omitted, and empty rows at the end of the table
   * are omitted.
   * @param {boolean} preserve_formula Save a cell's formula instead of its computed value.
   */
  export(preserve_formula) {
    let body = this.body_;
    let data = [];

    for (let lastRow = body.children.length - 1; lastRow > 0; lastRow--) {
      let row = body.children[lastRow];

      for (let j = 1; j < row.children.length; j++)
        if (this.getCell(lastRow, j, preserve_formula) != '')
          break;

      if (j < row.children.length) {
        // We broke before reaching the end of the row, so this is the last row with data.
        break;
      }
    }

    for (let i = 1; i < lastRow + 1; i++) {
      let row = body.children[i];
      let dataRow = data[i - 1] = [];

      for (let j = 1; j < row.children.length; j++) {
        let value = this.getCell(i, j, preserve_formula);

        if (value != '') {
          for (let k = dataRow.length; k < j - 1; k++)
            dataRow[k] = '';
          dataRow[k] = value;
        }
      }
    }

    return data;
  }

  /**
   * Focus on the currently selected cell.
   */
  focus() {
    this.editing = false;
    let input = this.getInput(this.row, this.col);
    input.blur();
    input.focus();
  }

  /**
   * Fetch the value of the given cell.
   * @param {number} row The row, with 0 being the top row.
   * @param {number} col The column, with 0 being the left edge (first cell of each row).
   * @param {boolean=} preserve_formula Return the cell's formula instead of its computed value.
   */
  getCell(row, col, preserve_formula) {
    let body = this.body_;

    if ((row >= body.children.length) || (col >= body.children[row].children.length))
      return '';
    let input = body.children[row].children[col];
    let value = preserve_formula ? input.dataset.formula : input.value;

    // Anything that isn't a "number" will turn into NaN, which is not equal to itself.
    if ((value != '') && (Number(value) == Number(value)))
      return Number(value);
    return value;
  }

  /**
   * Return the referenced cell's HTMLInputElement, adding rows/columns as necessary.
   * @param {number} row The row, with 1 being the top row.
   * @param {number} col The column, with 1 being the left edge (first cell of each row).
   */
  getInput(row, col) {
    let body = this.body_;

    // The initial table looks like [['']]. If we call getInput(3, 2), we need to add 3 more rows
    // (extending by 3 to the 4th row for our new value), then 2 more columns to all rows (old and
    // new--the new ones needing the initial blank column added as well).
    for (let i = body.children.length; i <= row; i++)
      body.appendChild(document.createElement('div'));

    let width = Math.max(col + 1, body.children[0].children.length);

    for (let i = 0; i < body.children.length; i++) {
      let tr = body.children[i];

      for (let j = tr.children.length; j < width; j++) {
        let input = document.createElement('input');
        tr.appendChild(input);
        input.dataset.row = i;
        input.dataset.col = j;
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
          input.addEventListener('blur', e => this.setCell(i, j, e.currentTarget.dataset.formula));
          input.addEventListener('change', e => {
            e.currentTarget.dataset.formula = e.currentTarget.value;
          });
          input.addEventListener('click', e => this.editing = false);
          input.addEventListener('dblclick', e => this.editing = true);
          input.addEventListener('focus', e => {
            this.mouseRow = this.endRow = this.row = i;
            this.mouseCol = this.endCol = this.col = j;
            this.setHighlight();
            e.currentTarget.value = e.currentTarget.dataset.formula;
            e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);
          });
        }
      }
    }

    return body.children[row].children[col];
  }

  /**
   * Load the given data into the spreadsheet, overwriting anything already present.
   * @param {Array.<Array.<string|null|number>>} data The initial data, as an array of arrays of rows
   *     of strings or numbers.
   */
  load(data) {
    // Clear the existing body.
    this.body_.textContent = '';

    for (let i = 0; i < data.length; i++) {
      let row = data[i];

      for (let j = 0; j < row.length; j++)
        this.setCell(i + 1, j + 1, row[j]);
    }
  }

  /**
   * Set the referenced cell to the given value, adding rows/columns as necessary.
   * @param {number} row The row, with 1 being the top row.
   * @param {number} col The column, with 1 being the left edge (first cell of each row).
   * @param {string|null|number} value The new value for the cell.
   */
  setCell(row, col, value) {
    let label = this.encodeLabel(row, col);
    if ((value === null) || (value === undefined))
      value = '';
    let input = this.getInput(row, col);
    let parents = this.splitSet(input.dataset.parents);
    for (let parentLabel of parents) {
      let parent = this.decodeLabel(parentLabel);
      let parentRow = parent[0], parentCol = parent[1];
      let parentInput = this.getInput(parentRow, parentCol);
      let children = this.splitSet(parentInput.dataset.children);
      children.delete(label);
      parentInput.dataset.children = [...children].join(',');
    }
    value = String(value);
    input.dataset.formula = value;
    let tmp = this.eval(value);
    input.value = tmp[0];
    input.dataset.parents = [...tmp[1]].join(',');
    for (let parentLabel of tmp[1]) {
      let parent = this.decodeLabel(parentLabel);
      let parentRow = parent[0], parentCol = parent[1];
      let parentInput = this.getInput(parentRow, parentCol);
      let children = this.splitSet(parentInput.dataset.children);
      children.add(label);
      parentInput.dataset.children = [...children].join(',');
    }
    let children = this.splitSet(input.dataset.children);
    for (let childLabel of children) {
      let child = this.decodeLabel(childLabel);
      let childRow = child[0], childCol = child[1];
      let childInput = this.getInput(childRow, childCol);
      this.setCell(childRow, childCol, childInput.dataset.formula);
    }
  }

  /**
   * Mark all cells from mouseRow, mouseCol through endRow, endCol as being selected.
   */
  setHighlight() {
    let body = this.body_;

    if (this.mouseRow > this.endRow) {
      let tmp = this.mouseRow;
      this.mouseRow = this.endRow;
      this.endRow = tmp;
    }
    if (this.mouseCol > this.endCol) {
      let tmp = this.mouseCol;
      this.mouseCol = this.endCol;
      this.endCol = tmp;
    }

    for (let i = 1; i < body.children.length; i++)
      body.children[i].children[0].className = (i >= this.mouseRow) && (i <= this.endRow) ? 'active' : '';

    for (let j = 1; j < body.children[0].children.length; j++)
      body.children[0].children[j].className = (j >= this.mouseCol) && (j <= this.endCol) ? 'active' : '';

    for (let i = 1; i < body.children.length; i++) {
      let row = body.children[i];

      for (let j = 1; j < row.children.length; j++)
        row.children[j].className = (
            (i >= this.mouseRow) && (i <= this.endRow) && (j >= this.mouseCol) && (j <= this.endCol) ? 'active' : '');
    }
  }

  /**
   * Split 'a,b,c' into ['a', 'b', 'c'], while splitting '' into [] (instead of ['']), and return the
   * result as a Set.
   * @param {string} s An empty or comma-delimited string.
   */
  splitSet(s) {
    if (!s)
      return new Set();
    return new Set(s.split(','));
  }
}
