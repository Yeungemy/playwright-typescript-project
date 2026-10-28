import type { Page } from '@playwright/test';

export class ActionUtils {
    constructor(private readonly page: Page) {}

    async navigateTo(url: string = '/'): Promise<void> {
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    }
}
