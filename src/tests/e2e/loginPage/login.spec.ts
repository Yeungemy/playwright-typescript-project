import { test, expect } from '../../../pages/index';

test.describe('Login Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.BASE_URL!);
  });

  test('@smoke should display the member portal link', async ({ loginPage }) => {
    await expect(loginPage.SELECTORS.memberPortalLink).toBeVisible();
  });

  test('@sanity should display the employer portal link', async ({ loginPage }) => {
    await expect(loginPage.SELECTORS.employerPortalLink).toBeVisible();
  });
});