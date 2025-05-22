import { test, expect } from '../pages/pageFactory';

test.describe('Login Page', () => {

  test.beforeEach(async () => {
    console.log(process.env.BASE_URL);
    
  });

  test('@smoke should display the member portal link', async ({ page }) => {
    await page.goto(process.env.BASE_URL, { timeout: 60000 });
  });

  test('@sanity should display the employer portal link', async ({ loginPage }) => {
    await expect(loginPage.SELECTORS.employerPortalLink).toBeVisible();
  });
});