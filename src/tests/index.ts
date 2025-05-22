import { test as base, mergeTests, request } from '@playwright/test';
import { test as pageObjectFixture } from './e2e/pages/pageFactory';
import { test as apiRequestFixture } from './api/pages/apiRequestFixture';

const test = mergeTests(pageObjectFixture, apiRequestFixture);

const expect = base.expect;
export { test, expect, request };