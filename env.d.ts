// env.d.ts
declare namespace NodeJS {
    interface ProcessEnv {
        BASE_URL: string;
        API_URL: string;
        TEST_USERNAME: string;
        TEST_PASSWORD: string;
        API_KEY: string;
        LOG_LEVEL: string;
        CWITESTRUN: string;
        VONEXT: string;
        BENADMINQA: string;
        MECONQA: string;
        DB_HOST: string;
        DB_USER: string;
        DB_PASS: string;
        DB_NAME: string;
        DB_DRIVER: string;
        DB_WAREHOUSE_NAME: string;
    }
}
