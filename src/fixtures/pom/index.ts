import { test as base, expect as baseExpect, mergeTests, request } from '@playwright/test';
import { test as pageFixtures } from './pageFixtures';
import { test as apiFixtures } from '../api/apiRequestFixture';
import { test as dbFixtures } from '../db/dbFixture';

const test = mergeTests(pageFixtures, apiFixtures, dbFixtures);

const expect = base.expect;
export { test, expect, request };
