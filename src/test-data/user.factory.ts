import { randomUUID } from 'node:crypto';

export type TestUser = {
    username: string;
    password: string;
    email: string;
};

export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
    const id = randomUUID().replaceAll('-', '');

    return {
        username: `test_user_${id.slice(0, 12)}`,
        password: `Test-${id}`,
        email: `test-${id}@example.test`,
        ...overrides,
    };
}
