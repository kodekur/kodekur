function updateImageUrls() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getDataRange();
  const values = range.getValues();

  for (let row = 1; row < values.length; row++) {
    const col2 = values[row][1]; // 2nd column
    if (col2 && /\d/.test(String(col2))) {
      values[row][0] = `=IMAGE("https://kodekur.ru/price_2026/images/${col2}.jpg")`;
    }
  }

  range.setValues(values);
}