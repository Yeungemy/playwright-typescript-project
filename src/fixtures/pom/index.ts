import { test as base, mergeTests, request } from '@playwright/test';
import { test as pageFixtures } from './pageFixtures';
import { test as dbFixtures } from '../db/dbFixture';
// import { test as apiFixtures } from '../api/apiFixtures';

const test = mergeTests(pageFixtures, dbFixtures);

const expect = base.expect;
export { test, expect, request };
