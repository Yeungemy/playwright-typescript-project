// env.d.ts
declare namespace NodeJS {
    interface ProcessEnv {
        ENVIRONMENT?: string;
        COM_DOMAIN?: string;
        CA_DOMAIN?: string;
        API_DOMAIN?: string;
        API_CLIENT_ID?: string;
        API_PASSWORD?: string;
        DB_HOST?: string;
        DB_USER?: string;
        DB_PASS?: string;
        DB_PRIMARY_Name?: string;
        DB_REPORT?: string;
        DB_WAREHOUSE?: string;
        HEADLESS?: string;
        CI?: string;
        WORKERS?: string;
        DEFAULT_TIMEOUT?: string;
        NAVIGATION_TIMEOUT?: string;
        ACTION_TIMEOUT?: string;
    }
}
