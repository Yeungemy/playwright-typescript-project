// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    BASE_URL: string;
    TEST_USERNAME: string;
    TEST_PASSWORD: string;
    API_KEY: string;
    LOG_LEVEL: string;
    CWITESTRUN: string;
    VONEXT: string;
    BENADMINQA: string;
    MECONQA: string;
  }
}
