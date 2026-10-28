import { test as base, type Page } from '@playwright/test';
import { HomePage } from '../pages/e2e/home.page';
import { ActionUtils } from '../utils/actionUtils';

export type UiFixture = {
    ui: {
        page: Page;
        homePage: HomePage;
        actions: ActionUtils;
    };
};

export const test = base.extend<UiFixture>({
    ui: async ({ page }, use) => {
        await use({
            page,
            homePage: new HomePage(page),
            actions: new ActionUtils(page),
        });
    },
});
