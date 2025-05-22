// Pages Factory to handle all page objects

import { test as base } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';

export type PageFactory = {
  loginPage: LoginPage;
};

export const test = base.extend<PageFactory>({
  loginPage: async ({page}, use) => {
    await use(new LoginPage(page));
  }
});

export { expect, request } from '@playwright/test';
