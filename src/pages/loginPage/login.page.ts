import { Page } from '@playwright/test';

export class LoginPage {
    // page instances
    private page: Page;

    // constructor
    constructor(page: Page) {
        this.page = page;
    }

    get SELECTORS() {
        return {
            headerLogo: ".header__logo",
            memberPortalLink: "//a[normalize-space(text())='{this.STRINGS.memberPortalLinkText}']",
            employerPortalLink: "//a[normalize-space(text())='{this.STRINGS.employerPortalLinkText}']",
        };
    }

    get STRINGS() {
        return {
            employerPortalLinkText: "Employer Portal",
            memberPortalLinkText: "Member Portal"
        };
    }
}