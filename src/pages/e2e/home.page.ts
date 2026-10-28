import type { Page } from '@playwright/test';

export class HomePage {
    constructor(private readonly page: Page) {}

    get STRINGS() {
        return {
            loginButtonText: 'Log in',
        };
    }

    get SELECTORS() {
        return {
            usernameInput: this.page.getByRole('textbox').first(),
            passwordInput: this.page.locator('input[type="password"]'),
            loginButton: this.page.getByRole('button', {
                name: new RegExp(`^${this.STRINGS.loginButtonText}$`, 'i'),
            }),
        };
    }
}
