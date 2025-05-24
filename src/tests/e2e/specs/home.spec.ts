import { test, expect } from '../../../fixtures/pom/index';

test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(process.env.BASE_URL);
    });

    test('@smoke should display the member portal link', async ({
        homePage,
    }) => {
        await test.step('Verify the member portal link is visible', async () => {
            await expect(homePage.SELECTORS.memberPortalLink).toBeVisible();
        });
    });

    test('@sanity should display the employer portal link', async ({
        homePage,
    }) => {
        await test.step('Verify the employer portal link is visible', async () => {
            await expect(homePage.SELECTORS.employerPortalLink).toBeVisible();
        });
    });
});
