function widenMergedFirstCells() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    console.log('No rows to process.');
    return;
  }

  const targetColumns = 8;
  const updatedRows = [];

  for (let row = 1; row <= lastRow; row++) {
    const cell = sheet.getRange(row, 1);
    if (!cell.isPartOfMerge()) {
      continue;
    }

    const mergedRanges = cell.getMergedRanges();
    if (!mergedRanges || mergedRanges.length === 0) {
      continue;
    }

    const mergedRange = mergedRanges[0];
    if (mergedRange.getRow() !== row || mergedRange.getNumColumns() === targetColumns) {
      continue;
    }

    const rowSpan = mergedRange.getNumRows();
    mergedRange.breakApart();
    sheet.getRange(row, 1, rowSpan, targetColumns).merge();
    updatedRows.push(row);
    console.log(`Updated row: ${row}`);
  }

  if (updatedRows.length) {
    console.log(`Updated rows: ${updatedRows.join(', ')}`);
  } else {
    console.log('No merged rows required updates.');
  }
}
