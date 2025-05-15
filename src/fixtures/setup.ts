import { LoginPage } from "../pages/loginPage/login.page";
import { test as base } from '@playwright/test';

type setupFixtures = {
    loginPage: LoginPage
};

export const test = base.extend<setupFixtures>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    }
});