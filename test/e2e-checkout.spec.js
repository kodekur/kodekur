import { test, expect } from '@playwright/test';

/**
 * End-to-end test for the e-commerce checkout flow.
 *
 * This test verifies the complete happy path:
 * 1. Load the product catalog (market.html)
 * 2. Wait for products to load from Google Sheets
 * 3. Add a product to the cart
 * 4. Navigate to checkout (korzina.html)
 * 5. Fill out the order form with test data
 * 6. Submit the order
 * 7. Verify success message appears
 *
 * Note: Uses name="TEST" to trigger test mode in the order counter.
 */
test.describe('E-commerce Checkout Flow', () => {
  test('complete checkout workflow - success scenario', async ({ page }) => {
    // Step 1: Navigate to product catalog
    await test.step('Load product catalog', async () => {
      await page.goto('/market.html');
      await expect(page).toHaveTitle(/Ассортимент/);
    });

    // Step 2: Wait for catalog to load from Google Sheets
    await test.step('Wait for products to load', async () => {
      // Wait for the loading indicator to disappear
      await page.waitForSelector('#catalog-loading', { state: 'hidden', timeout: 30000 });

      // Wait for at least one product row to appear
      await page.waitForSelector('#catalog-table table tr', { timeout: 30000 });

      // Verify catalog table is visible
      const catalogTable = page.locator('#catalog-table table');
      await expect(catalogTable).toBeVisible();
    });

    // Step 3: Find and add a product to cart
    await test.step('Add product to cart', async () => {
      // Find the first "В корзину" button that's visible
      // These buttons are dynamically added to cells where season availability is "да"
      const addToCartButton = page.locator('button.add-to-cart:has-text("В корзину")').first();

      // Wait for at least one add-to-cart button to be available
      await expect(addToCartButton).toBeVisible({ timeout: 10000 });

      // Click the button to add to cart
      await addToCartButton.click();

      // Verify checkout button becomes enabled (cart is no longer empty)
      const checkoutButton = page.locator('#checkout-button');
      await expect(checkoutButton).toBeEnabled({ timeout: 5000 });
    });

    // Step 4: Navigate to checkout page
    await test.step('Navigate to checkout', async () => {
      // Click the checkout button
      const checkoutButton = page.locator('#checkout-button');
      await expect(checkoutButton).toBeEnabled();
      await checkoutButton.click();

      // Wait for checkout page to load
      await expect(page).toHaveURL(/korzina\.html/);
      await expect(page).toHaveTitle(/Корзина/);
    });

    // Step 5: Verify cart has items
    await test.step('Verify cart contains items', async () => {
      const cartTable = page.locator('#cart-table');
      await expect(cartTable).toBeVisible();

      // Verify empty message is hidden
      const emptyMessage = page.locator('#empty-message');
      await expect(emptyMessage).not.toBeVisible();
    });

    // Step 6: Fill out the order form with test data
    await test.step('Fill out order form', async () => {
      // Fill in required fields with test data
      // Using "TEST" as name triggers test mode in the order counter
      await page.fill('#name', 'TEST');
      await page.fill('#recipient', 'knopko@gmail.com');
      await page.fill('#phone-number', '+7 (999) 123-45-67');

      // Select delivery method (required)
      await page.check('input[name="deliveryMethod"][value="pickup"]');

      // Wait for delivery fields to update
      await page.waitForTimeout(500);
    });

    // Step 7: Submit the order
    await test.step('Submit order', async () => {
      const submitButton = page.locator('#checkout-button[type="submit"]');
      await expect(submitButton).toBeEnabled();

      // Click submit and wait for the form submission
      await submitButton.click();

      // Wait for loading indicator to appear and then disappear
      const loadingIndicator = page.locator('#submit-loading');
      await expect(loadingIndicator).toBeVisible({ timeout: 2000 });
    });

    // Step 8: Verify success message
    await test.step('Verify order success', async () => {
      // Wait for success message to appear
      const statusDiv = page.locator('#status');
      await expect(statusDiv).toBeVisible({ timeout: 15000 });
      await expect(statusDiv).toContainText(/успешно оформлен/, { timeout: 5000 });
      await expect(statusDiv).toHaveClass(/success/);

      // Verify form is hidden after successful submission
      const emailForm = page.locator('#emailForm');
      await expect(emailForm).not.toBeVisible();

      // Verify order summary is displayed
      const orderSummary = page.locator('#order-summary');
      await expect(orderSummary).toBeVisible();
    });
  });
});
