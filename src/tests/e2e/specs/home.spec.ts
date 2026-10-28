import { expect, test } from '../../../fixtures';

test.describe('Login Page', () => {
    test.beforeEach(async ({ ui }) => {
        await ui.actions.navigateTo();
    });

    test('@smoke @sanity should display the login form', async ({ ui }) => {
        await test.step('Verify the login controls are visible', async () => {
            await expect(ui.homePage.SELECTORS.usernameInput).toBeVisible();
            await expect(ui.homePage.SELECTORS.passwordInput).toBeVisible();
            await expect(ui.homePage.SELECTORS.loginButton).toBeVisible();
        });
    });
});
