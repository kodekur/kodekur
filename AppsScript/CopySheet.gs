function copyDataToAnotherSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheet = spreadsheet.getSheetById(992018491);   // Исходный Лист // Хвойные
  const targetSheet = spreadsheet.getSheetById(727164352);   // Целевой Лист

  const sourceRange = sourceSheet.getDataRange();
  const numRows = sourceRange.getNumRows();
  const numCols = sourceRange.getNumColumns();

  const startRow = 687; // 91;
  const startColumn = 1;
  const destination = targetSheet.getRange(startRow, startColumn);

  // clear old content if needed
  targetSheet.getRange(startRow, startColumn, numRows, numCols)
             .clear({contentsOnly: true, formatOnly: false});

  // copies values + formulas + formatting + inline images
  sourceRange.copyTo(destination, {contentsOnly: false});

  // Copy images that float over the cells (optional)
  sourceSheet.getImages().forEach(image => {
    const anchor = image.getAnchorCell();
    const row = anchor.getRow();
    const col = anchor.getColumn();
    if (row >= sourceRange.getRow() && row < sourceRange.getRow() + numRows &&
        col >= sourceRange.getColumn() && col < sourceRange.getColumn() + numCols) {
      targetSheet.insertImage(image.getBlob(), col, row + (startRow - 1))
                 .setWidth(image.getWidth())
                 .setHeight(image.getHeight());
    }
  });
}
