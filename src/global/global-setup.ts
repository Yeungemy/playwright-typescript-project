import { FullConfig } from '@playwright/test';
import { TestData } from '../data/testData';
import { logger } from '../helpers/loggerHelper';

async function globalSetup(config: FullConfig) {
    // const { baseUrl, environment } = TestData.getTestDataFromEnv();
    
    // logger.info(`Starting tests in ${environment} environment`);
    // logger.info(`Base URL: ${baseUrl}`);

    // Add any global setup logic here
    // For example: setting up test data, cleaning up previous test runs, etc.
}

export default globalSetup; 