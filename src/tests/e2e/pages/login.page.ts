import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  constructor(protected page: Page) {
    super(page);
  }

  /**
   * Strings used in the login page.
   */
  get STRINGS() {
    return {
      employerPortalLinkText: 'Employer Portal',
      memberPortalLinkText: 'Member Portal'
    }
  };

  /**
   * Selectors used in the login page.
   */
  get SELECTORS() {
    return {
      memberPortalLink: this.page.locator(`//a[normalize-space(text())='${this.STRINGS.memberPortalLinkText}']`),
      employerPortalLink: this.page.locator(`//a[contains(normalize-space(text()), '${this.STRINGS.employerPortalLinkText}')]`)
    };
  }

  /**
   * Clicks the Member Portal link on the login page.
   * @returns {Promise<void>}
   */
  async clickMemberPortalLink(): Promise<void> {
    await this.SELECTORS.memberPortalLink.click();
  }

  /**
   * Clicks the Employer Portal link on the login page.
   * @returns {Promise<void>}
   */
  async clickEmployerPortalLink(): Promise<void> {
    await this.SELECTORS.employerPortalLink.click();
  }
}
