import { Locator, test, expect as playwrightExpect } from '@playwright/test';


function expect(locator: Locator) {
    return {
        async toBeVisible() {
            await playwrightExpect(locator).toBeVisible();
        }
    };
}

test.describe.fixme('Login Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('baseURL');
    });

    // test('should display the header logo', async ({ page }) => {
    //     await expect(LoginPage.SELECTORS.headerLogo).toBeVisible();
    // });

    test('should display the member portal link', async ({ page }) => {
        const memberPortalLink = page.locator("//a[normalize-space(text())='Member Portal']");
        await expect(memberPortalLink).toBeVisible();
    });

    test('should display the employer portal link', async ({ page }) => {
        const employerPortalLink = page.locator("//a[normalize-space(text())='Employer Portal']");
        await expect(employerPortalLink).toBeVisible();
    });
});

