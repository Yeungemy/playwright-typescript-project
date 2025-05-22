// Pages Factory to handle all page objects

import { test as base } from '@playwright/test';
import { LoginPage } from './login.page';

export type FrameworkFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<FrameworkFixtures>({
  loginPage: async ({page}, use) => {
    await use(new LoginPage(page));
  }
});

export { expect, request } from '@playwright/test';
