import { expect, test } from '../../fixtures';
import {
    buildEnvironmentUrls,
    parseEnvironmentConfiguration,
    requireEnvironmentValue,
    resolveEnvironmentTemplate,
} from '../../config/environment';

const validSettings = {
    ENVIRONMENT: 'cwi-test',
    COM_DOMAIN: 'example.com',
    CA_DOMAIN: 'example.ca',
    API_DOMAIN: 'identity-api/v1',
};

test.describe('Environment configuration', () => {
    test('builds normalized URLs using the environment domain rule', () => {
        expect(
            buildEnvironmentUrls({
                environmentName: '  CWI-Test ',
                comDomain: ' .EXAMPLE.COM. ',
                caDomain: 'example.ca',
                apiDomain: '/identity-api/v1/',
            })
        ).toEqual({
            baseUrl: 'https://cwi-test.example.com',
            apiUrl: 'https://cwi-test.example.com/identity-api/v1',
        });

        expect(
            buildEnvironmentUrls({
                environmentName: 'vonext',
                comDomain: 'example.com',
                caDomain: 'example.ca',
                apiDomain: 'identity-api',
            }).baseUrl
        ).toBe('https://vonext.example.com');
        expect(
            buildEnvironmentUrls({
                environmentName: 'test',
                comDomain: 'example.com',
                caDomain: 'example.ca',
                apiDomain: 'identity-api',
            }).baseUrl
        ).toBe('https://test.example.ca');
    });

    test('rejects invalid DNS lengths and URL components', () => {
        expect(() =>
            buildEnvironmentUrls({
                environmentName: 'a'.repeat(64),
                comDomain: 'example.com',
                caDomain: 'example.ca',
                apiDomain: 'identity-api',
            })
        ).toThrow();
        expect(() =>
            buildEnvironmentUrls({
                environmentName: 'test',
                comDomain: `${'a'.repeat(64)}.example.com`,
                caDomain: 'example.ca',
                apiDomain: 'identity-api',
            })
        ).toThrow();
        expect(() =>
            buildEnvironmentUrls({
                environmentName: 'test',
                comDomain: 'example.com',
                caDomain: 'example.ca',
                apiDomain: '../admin',
            })
        ).toThrow();
    });

    test('applies defaults and parses optional configuration consistently', () => {
        const configuration = parseEnvironmentConfiguration({
            ...validSettings,
            WORKERS: ' ',
            HEADLESS: '  ',
            CI: '1',
            DEFAULT_TIMEOUT: ' ',
            NAVIGATION_TIMEOUT: '45000',
            ACTION_TIMEOUT: undefined,
            DB_PRIMARY_Name: ' ${ENVIRONMENT}_Primary ',
            API_CLIENT_ID: ' ',
        });

        expect(configuration.headless).toBe(true);
        expect(configuration.isCi).toBe(true);
        expect(configuration.workers).toBeUndefined();
        expect(configuration.defaultTimeout).toBe(30000);
        expect(configuration.navigationTimeout).toBe(45000);
        expect(configuration.actionTimeout).toBe(15000);
        expect(configuration.dbPrimaryName).toBe('cwi-test_Primary');
        expect(configuration.apiClientId).toBeUndefined();
    });

    test('rejects invalid boolean and non-positive numeric settings', () => {
        expect(() =>
            parseEnvironmentConfiguration({
                ...validSettings,
                HEADLESS: 'sometimes',
            })
        ).toThrow();
        expect(() =>
            parseEnvironmentConfiguration({
                ...validSettings,
                WORKERS: '0',
            })
        ).toThrow();
        expect(() =>
            parseEnvironmentConfiguration({
                ...validSettings,
                DEFAULT_TIMEOUT: '-1',
            })
        ).toThrow();
    });

    test('resolves only the supported database-name placeholder', () => {
        expect(
            resolveEnvironmentTemplate(' ${ENVIRONMENT}_Report ', 'test')
        ).toBe('test_Report');
        expect(resolveEnvironmentTemplate(' ', 'test')).toBeUndefined();
        expect(() =>
            resolveEnvironmentTemplate('${UNKNOWN}_Report', 'test')
        ).toThrow('unsupported variable placeholder');
    });

    test('requires a non-blank environment value', () => {
        expect(requireEnvironmentValue(' value ', 'SETTING')).toBe('value');
        expect(() => requireEnvironmentValue('  ', 'SETTING')).toThrow(
            'SETTING environment variable must be configured'
        );
    });
});
