import { mergeTests } from '@playwright/test';
export { expect } from '@playwright/test';
import { test as pageFixtures } from './pages.fixture';
import { test as databaseFixtures } from './database.fixture';
import { test as apiFixtures } from './api.fixture';
import { test as failureReportingFixtures } from './failure-reporting.fixture';

const test = mergeTests(
    pageFixtures,
    databaseFixtures,
    apiFixtures,
    failureReportingFixtures
);

export { test };
