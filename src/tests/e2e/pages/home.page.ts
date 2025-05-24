import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
    constructor(protected page: Page) {
        super(page);
    }

    /**
     * Strings used in the home page.
     */
    get STRINGS() {
        return {
            employerPortalLinkText: 'Employer Portal',
            memberPortalLinkText: 'Member Portal',
        };
    }

    /**
     * Selectors used in the home page.
     */
    get SELECTORS() {
        return {
            memberPortalLink: this.page.locator(
                `//a[normalize-space(text())='${this.STRINGS.memberPortalLinkText}']`
            ),
            employerPortalLink: this.page.locator(
                `//a[contains(normalize-space(text()), '${this.STRINGS.employerPortalLinkText}')]`
            ),
        };
    }

    /**
     * Clicks the Member Portal link on the home page.
     * @returns {Promise<void>}
     */
    async clickMemberPortalLink(): Promise<void> {
        await this.SELECTORS.memberPortalLink.click();
    }

    /**
     * Clicks the Employer Portal link on the home page.
     * @returns {Promise<void>}
     */
    async clickEmployerPortalLink(): Promise<void> {
        await this.SELECTORS.employerPortalLink.click();
    }
}
