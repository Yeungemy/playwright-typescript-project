import { test as setup, expect } from './src/tests';
import { User } from './src/tests/api/pages/typeGuards';
import { UserSchema } from './src/tests/api/pages/schemas';


setup('auth user', async ({ apiRequest, loginPage }) => {
    await setup.step('auth for user by API', async () => {
        const { status, body } = await apiRequest<User>({
            method: 'POST',
            url: process.env.API_URL,
            baseUrl: process.env.API_URL,
            body: {
                user: {
                    email: process.env.EMAIL,
                    password: process.env.PASSWORD,
                },
            },
        });

        expect(status).toBe(200);
        expect(UserSchema.parse(body)).toBeTruthy();

        process.env['ACCESS_TOKEN'] = body.user.token;
    });

    await setup.step('Navigate to employer portal account login page', async () => {
        await loginPage.clickEmployerPortalLink();
    });
});