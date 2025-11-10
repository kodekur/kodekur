/**
 * Collects all values from column B of SOURCE_SHEET_ID that contain at least one digit
 * and marks matching values in column F of TARGET_SHEET_ID with "да".
 */
function markExistingItems() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
//  const sourceSheet = spreadsheet.getSheetById(1359583878);   // ВЕСНА Лист
  const sourceSheet = spreadsheet.getSheetById(1034014845);   // ЛЕТО Лист
//  const sourceSheet = spreadsheet.getSheetById(36763308);   // ОСЕНЬ Лист
  const targetSheet = spreadsheet.getSheetById(2017833702);   // all rows Лист

  const sourceSet = collectSecondColumnValues_(sourceSheet);
  if (!sourceSet.size) return;

  const lastRow = targetSheet.getLastRow();
  if (lastRow < 2) return; // nothing below the header

  const columnB = targetSheet.getRange(2, 2, lastRow - 1, 1).getValues();
  const columnFRange = targetSheet.getRange(2, 6, lastRow - 1, 1);
  const columnFValues = columnFRange.getValues();

  let j = 0;
  for (let i = 0; i < columnB.length; i++) {
    const value = normalizeCellValue_(columnB[i][0]);
    if (value && sourceSet.has(value)) {
      columnFValues[i][0] = 'да';
      j++;
    }
  }
  console.info("setting DA: ", j);

  columnFRange.setValues(columnFValues);
}

function collectSecondColumnValues_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return new Set();

  const values = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  const set = new Set();

  for (const row of values) {
    const value = normalizeCellValue_(row[0]);
    if (value && /\d/.test(value)) {
      set.add(value);
    }
  }

  console.info("len of set: ", set.size);

  return set;
}

function normalizeCellValue_(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}
