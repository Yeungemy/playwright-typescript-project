// Pages Factory to handle all page objects

import { test as base } from '@playwright/test';
import { HomePage } from '../../tests/e2e/pages/home.page';

export type PageFactory = {
    homePage: HomePage;
};

export const test = base.extend<PageFactory>({
    homePage: async ({ page }, use) => {
        await use(new HomePage(page));
    },
});

export { expect, request } from '@playwright/test';
