import { test, expect } from '../pages/pageFactory';

test.describe('Login Page', () => {

  test.beforeEach(async ({ page }) => {
    console.log(process.env.BASE_URL);
    await page.goto(process.env.BASE_URL, { timeout: 60000 });
  });

  test('@smoke should display the member portal link', async ({ loginPage }) => {
    await expect(loginPage.SELECTORS.memberPortalLink).toBeVisible();
  });

  test('@sanity should display the employer portal link', async ({ loginPage }) => {
    await expect(loginPage.SELECTORS.employerPortalLink).toBeVisible();
  });
});