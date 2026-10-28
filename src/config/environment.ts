import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

const optionalString = z.preprocess(
    (value) =>
        typeof value === 'string' && value.trim() === '' ? undefined : value,
    z.string().trim().optional()
);

const optionalPositiveInteger = z.preprocess(
    (value) =>
        value === undefined ||
        (typeof value === 'string' && value.trim() === '')
            ? undefined
            : Number(value),
    z.number().int().positive().optional()
);

const positiveInteger = (defaultValue: number) =>
    z.preprocess(
        (value) =>
            value === undefined ||
            (typeof value === 'string' && value.trim() === '')
                ? defaultValue
                : Number(value),
        z.number().int().positive()
    );

const booleanSetting = (defaultValue: boolean) =>
    z.preprocess((value) => {
        if (
            value === undefined ||
            (typeof value === 'string' && value.trim() === '')
        ) {
            return defaultValue;
        }
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase();
            if (normalized === 'true' || normalized === '1') return true;
            if (normalized === 'false' || normalized === '0') return false;
        }
        return value;
    }, z.boolean());

export function resolveEnvironmentTemplate(
    value: string | undefined,
    name: string
) {
    const normalizedValue = value?.trim();
    if (!normalizedValue) {
        return undefined;
    }

    const resolved = normalizedValue.replaceAll('${ENVIRONMENT}', name);
    if (/\$\{[^}]+\}/.test(resolved)) {
        throw new Error(
            `${normalizedValue} contains an unsupported variable placeholder`
        );
    }
    return resolved;
}

const environmentNameSchema = z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.toLowerCase())
    .refine(
        (value) =>
            value.length <= 63 &&
            /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(value),
        'ENVIRONMENT must be a valid DNS label'
    );

const domainSchema = z
    .string()
    .trim()
    .transform((value) => value.replace(/^\.+|\.+$/g, '').toLowerCase())
    .refine(
        (value) =>
            value.length > 0 &&
            value.length <= 253 &&
            !value.includes('..') &&
            /^[a-z0-9.-]+$/.test(value) &&
            value
                .split('.')
                .every(
                    (label) =>
                        label.length <= 63 &&
                        /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label)
                ),
        'Domain values must be host names without a scheme, port, or path'
    );

const apiDomainSchema = z
    .string()
    .trim()
    .transform((value) => value.replace(/^\/+|\/+$/g, ''))
    .refine(
        (value) =>
            value.length > 0 &&
            value
                .split('/')
                .every(
                    (segment) =>
                        segment !== '.' &&
                        segment !== '..' &&
                        /^[a-zA-Z0-9._~-]+$/.test(segment)
                ),
        'API_DOMAIN must be a relative URL path'
    );

export type EnvironmentUrlSettings = {
    environmentName: string;
    comDomain: string;
    caDomain: string;
    apiDomain: string;
};

export function buildEnvironmentUrls(settings: EnvironmentUrlSettings): {
    baseUrl: string;
    apiUrl: string;
} {
    const parsed = z
        .object({
            environmentName: environmentNameSchema,
            comDomain: domainSchema,
            caDomain: domainSchema,
            apiDomain: apiDomainSchema,
        })
        .parse(settings);

    const isComEnvironment =
        parsed.environmentName.includes('cwi') ||
        parsed.environmentName === 'vonext';
    const domain = isComEnvironment ? parsed.comDomain : parsed.caDomain;
    const baseUrl = `https://${parsed.environmentName}.${domain}`;

    return {
        baseUrl,
        apiUrl: `${baseUrl}/${parsed.apiDomain}`,
    };
}

const environmentSchema = z.object({
    ENVIRONMENT: environmentNameSchema,
    COM_DOMAIN: domainSchema,
    CA_DOMAIN: domainSchema,
    API_DOMAIN: apiDomainSchema,
    API_CLIENT_ID: optionalString,
    API_PASSWORD: optionalString,
    DB_HOST: optionalString,
    DB_USER: optionalString,
    DB_PASS: optionalString,
    DB_PRIMARY_Name: optionalString,
    DB_REPORT: optionalString,
    DB_WAREHOUSE: optionalString,
    HEADLESS: booleanSetting(true),
    CI: booleanSetting(false),
    WORKERS: optionalPositiveInteger,
    DEFAULT_TIMEOUT: positiveInteger(30000),
    NAVIGATION_TIMEOUT: positiveInteger(30000),
    ACTION_TIMEOUT: positiveInteger(15000),
});

export function parseEnvironmentConfiguration(source: Record<string, unknown>) {
    const parsedEnvironment = environmentSchema.parse(source);
    const urls = buildEnvironmentUrls({
        environmentName: parsedEnvironment.ENVIRONMENT,
        comDomain: parsedEnvironment.COM_DOMAIN,
        caDomain: parsedEnvironment.CA_DOMAIN,
        apiDomain: parsedEnvironment.API_DOMAIN,
    });

    return {
        baseUrl: urls.baseUrl,
        apiUrl: urls.apiUrl,
        environmentName: parsedEnvironment.ENVIRONMENT,
        apiClientId: parsedEnvironment.API_CLIENT_ID,
        apiPassword: parsedEnvironment.API_PASSWORD,
        dbHost: parsedEnvironment.DB_HOST,
        dbUser: parsedEnvironment.DB_USER,
        dbPassword: parsedEnvironment.DB_PASS,
        dbPrimaryName: resolveEnvironmentTemplate(
            parsedEnvironment.DB_PRIMARY_Name,
            parsedEnvironment.ENVIRONMENT
        ),
        dbReportName: resolveEnvironmentTemplate(
            parsedEnvironment.DB_REPORT,
            parsedEnvironment.ENVIRONMENT
        ),
        dbWarehouseName: resolveEnvironmentTemplate(
            parsedEnvironment.DB_WAREHOUSE,
            parsedEnvironment.ENVIRONMENT
        ),
        headless: parsedEnvironment.HEADLESS,
        isCi: parsedEnvironment.CI,
        workers: parsedEnvironment.WORKERS,
        defaultTimeout: parsedEnvironment.DEFAULT_TIMEOUT,
        navigationTimeout: parsedEnvironment.NAVIGATION_TIMEOUT,
        actionTimeout: parsedEnvironment.ACTION_TIMEOUT,
    };
}

export const environment = Object.freeze(
    parseEnvironmentConfiguration(process.env)
);

export function requireEnvironmentValue(
    value: string | undefined,
    name: string
): string {
    const normalizedValue = value?.trim();
    if (!normalizedValue) {
        throw new Error(`The ${name} environment variable must be configured`);
    }
    return normalizedValue;
}
