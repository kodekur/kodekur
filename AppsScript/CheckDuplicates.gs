function logSecondColumnDuplicates() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return; // nothing below header

  const values = sheet.getRange(2, 2, lastRow - 1, 1).getValues(); // column B
  const seen = new Map();

  values.forEach((row, idx) => {
    const value = String(row[0]).trim();
    if (!value) return;

    const sheetRow = idx + 2; // offset for header
    if (seen.has(value)) {
      Logger.log(`Duplicate at row ${sheetRow}: ${value}`);
    } else {
      seen.set(value, sheetRow);
    }
  });
}
