function fixFormatting() {
//  const sh = SpreadsheetApp.getActiveSheet();
  const sh = SpreadsheetApp.getActive().getSheetByName("Импорт");

  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  const values = sh.getRange(1, 1, lastRow, 1).getValues();

  const boldColumnsCount = Math.min(3, lastCol) - 1;
  if (lastRow > 0 && boldColumnsCount > 0) {
    sh.getRange(1, 2, lastRow, boldColumnsCount).setFontWeight("bold"); // выделить 2 и 3 колонку
  }

  if (lastRow > 0) {
    const headerRange = sh.getRange(1, 1, 1, lastCol);
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
  }

  if (lastRow > 1) {
    const skipColumns = new Set([3, 4]); // не выравнивать 3 и 4 колонки
    const dataRowCount = lastRow - 1;
    let segmentStart = null;

    for (let col = 1; col <= lastCol; col++) {
      const shouldSkip = skipColumns.has(col);
      if (!shouldSkip && segmentStart === null) segmentStart = col;

      if ((shouldSkip || col === lastCol) && segmentStart !== null) {
        const segmentEnd = shouldSkip ? col - 1 : col;
        const segmentWidth = segmentEnd - segmentStart + 1;
        if (segmentWidth > 0) {
          const range = sh.getRange(2, segmentStart, dataRowCount, segmentWidth);
          range.setHorizontalAlignment("center");
        }
        segmentStart = null;
      }
    }
  }

  // all cells -- vertically center alignment.
  sh.getRange(1, 1, lastRow, lastCol).setVerticalAlignment("middle");

  // высота по фото
  for (let i = 0; i < lastRow; i++) {
    const row = i + 1;
    const v = values[i][0];
    const hasPhoto = v && typeof v !== 'string';
    console.log("hasPhoto: ", hasPhoto)
    if (hasPhoto) {
      sh.setRowHeight(row, 80); // фиксированная высота для фото
    } else {
      sh.autoResizeRows(row, 1); // вернуть «по содержимому»
      const rowRange = sh.getRange(row, 1, 1, lastCol);
      rowRange.setFontWeight("bold"); // выделить заголовки
      rowRange.setBackground("#99FF99"); // подсветить заголовки
    }
  }

  sh.autoResizeColumns(2, lastCol - 1);
  sh.setColumnWidth(1, 80);
  sh.setColumnWidth(3, 300);
  sh.setColumnWidth(4, 700);

  if (lastRow > 0 && lastCol >= 3) {
    const wrapWidth = Math.min(2, lastCol - 2);
    sh.getRange(1, 3, lastRow, wrapWidth).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  }

  // TODO отступы 1 px для всех ячеек с данными
  // sh.getRange(1, 1, lastRow, lastCol).setPadding(1, 1, 1, 1);
}
