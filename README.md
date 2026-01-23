# Kodekur - Коллекция Декоративных Культур

E-commerce website for a private collection of decorative plants, published on GitHub Pages.

## E2E Testing

This repository includes automated end-to-end tests to verify the checkout workflow is functioning correctly.

### Test Setup

- **Technology**: [Playwright](https://playwright.dev/) - Modern browser automation framework
- **Schedule**: Tests run automatically every Monday at 9:00 AM UTC via GitHub Actions
- **Test Coverage**: Complete checkout flow from product catalog to order submission

### Running Tests Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

3. Run tests:
   ```bash
   npm test
   ```

4. Run tests in headed mode (see browser):
   ```bash
   npm run test:headed
   ```

5. Debug tests:
   ```bash
   npm run test:debug
   ```

### Test Workflow

The E2E test verifies the complete success scenario:

1. ✅ Loads the product catalog (`market.html`)
2. ✅ Waits for products to load from Google Sheets
3. ✅ Adds a product to the cart
4. ✅ Navigates to checkout page (`korzina.html`)
5. ✅ Fills out the order form with test data
6. ✅ Submits the order
7. ✅ Verifies success message appears

**Note**: The test uses `name="TEST"` in the order form, which triggers test mode in the order counter system, preventing real orders from being created.

### GitHub Actions

The weekly test runs automatically via GitHub Actions workflow (`.github/workflows/weekly-e2e-test.yml`). You can also trigger it manually from the Actions tab in GitHub.

If the test fails, a GitHub issue will be automatically created to notify you.

### Viewing Test Results

After a test run completes:
- View the workflow run in the Actions tab
- Download the `playwright-report` artifact to see detailed test results and screenshots
