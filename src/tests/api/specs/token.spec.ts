import { expect, test } from '../../../fixtures';

test('@api @smoke retrieves an OAuth access token', async ({ api }) => {
    expect(api.token.trim()).toBeTruthy();
});
