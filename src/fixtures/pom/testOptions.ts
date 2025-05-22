import { test as base, mergeTests, request } from '@playwright/test';
import { test as pageObjectFixture } from './pageFactory';
import { test as apiRequestFixture } from '../api/apiRequestFixture';

const test = mergeTests(pageObjectFixture, apiRequestFixture);

const expect = base.expect;
export { test, expect, request };