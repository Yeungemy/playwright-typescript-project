import { expect, test } from '../../fixtures';
import { createTestUser } from '../../test-data/user.factory';

test.describe('Test user factory', () => {
    test('creates unique users with complete values', () => {
        const firstUser = createTestUser();
        const secondUser = createTestUser();

        expect(firstUser.username).toMatch(/^test_user_[\da-f]{12}$/);
        expect(firstUser.password).toMatch(/^Test-[\da-f]{32}$/);
        expect(firstUser.email).toMatch(/^test-[\da-f]{32}@example\.test$/);
        expect(firstUser.username).not.toBe(secondUser.username);
        expect(firstUser.email).not.toBe(secondUser.email);
    });

    test('applies explicit overrides without replacing other values', () => {
        const user = createTestUser({ username: 'provided-user' });

        expect(user.username).toBe('provided-user');
        expect(user.password).toMatch(/^Test-[\da-f]{32}$/);
        expect(user.email).toMatch(/^test-[\da-f]{32}@example\.test$/);
    });
});
