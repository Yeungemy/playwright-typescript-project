import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get STRINGS() {
    return {
      employerPortalLinkText: 'Employer Portal',
      memberPortalLinkText: 'Member Portal'
    }
  };

  get SELECTORS() {
    return {
      memberPortalLink: this.page.locator(`//a[normalize-space(text())='${this.STRINGS.memberPortalLinkText}']`),
      employerPortalLink: this.page.locator(`//a[contains(normalize-space(text()), '${this.STRINGS.employerPortalLinkText}')]`)
    };
  }

  async clickMemberPortalLink() {
    await this.SELECTORS.memberPortalLink.click();
  }

  async clickEmployerPortalLink() {
    await this.SELECTORS.employerPortalLink.click();
  }
}
