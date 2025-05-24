import { test, expect } from '../../../fixtures/pom/index';

test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
        page.goto(process.env.BASE_URL);
    });

    test('@smoke should display the member portal link', async ({
        homePage,
    }) => {
        await expect(homePage.SELECTORS.memberPortalLink).toBeVisible();
    });

    test('@sanity should display the employer portal link', async ({
        homePage,
    }) => {
        await expect(homePage.SELECTORS.employerPortalLink).toBeVisible();
    });
});
