# Playwright TypeScript Automation Framework

This project uses Playwright Test to run browser, API, and SQL Server checks.
Reusable fixtures, page objects, service clients, test data, and reporting
utilities live under `src/`; specs live under `src/tests/`.

## Project layout

```text
src/
  config/       Environment validation and application/API URL construction
  fixtures/     Composed UI, API, database, and failure-reporting fixtures
  pages/        UI page objects, API clients, and SQL Server utilities
  reporting/    Failure history, dashboard rendering, and report integration
  test-data/    Test data factories and JSON fixtures
  tests/        API, database, UI, reporting, and test-data specs
```

Tests import `test` and `expect` from `src/fixtures`. Request only the fixture
needed for a test: `{ ui }`, `{ api }`, or `{ database }`. This keeps browser,
API, and database setup lazy so unrelated services are not initialized.

## Setup

Requirements: Node.js (version 18 or newer), npm, and access to any external
services covered by the tests you plan to run.

```sh
npm ci
npx playwright install chromium
```

Copy `.env.example` to `.env`. Configure the required environment and URL
settings before running Playwright. Add API credentials and database
credentials only for suites that use those services. Do not commit `.env` or
real credentials.

```sh
npm run typecheck
npm test
```

## Configuration

`src/config/environment.ts` validates configuration when the test process
starts. These URL settings are required:

| Variable      | Purpose                                                          |
| ------------- | ---------------------------------------------------------------- |
| `ENVIRONMENT` | Environment name used to build the service host names            |
| `COM_DOMAIN`  | Host suffix when `ENVIRONMENT` contains `cwi` or equals `vonext` |
| `CA_DOMAIN`   | Host suffix for other environment names                          |
| `API_DOMAIN`  | Relative API path appended to the base URL                       |

`BASE_URL` and `API_URL` are derived from these settings; they are not read
directly from the environment. The URLs use HTTPS.

Database tests require `DB_HOST`, `DB_USER`, `DB_PASS`, and `DB_PRIMARY_Name`.
`DB_REPORT` and `DB_WAREHOUSE` are optional database-name settings. A
`${ENVIRONMENT}` placeholder in a database name is replaced with the
normalized environment name.

API tests require `API_CLIENT_ID` and `API_PASSWORD`. Values are validated when
the API fixture is requested, so reporting and test-data tests do not need API
credentials. Database credentials are similarly required only when the
database fixture is used.

| Optional variable                 | Default                                      | Purpose                                                                                               |
| --------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `CI`                              | `false`                                      | Enables CI behavior: forbid focused tests, retry failures, and use one worker unless `WORKERS` is set |
| `HEADLESS`                        | `true`                                       | Run browsers without a visible window                                                                 |
| `WORKERS`                         | Playwright default locally; one worker in CI | Set a positive worker count                                                                           |
| `DEFAULT_TIMEOUT`                 | `30000`                                      | Playwright assertion timeout in milliseconds                                                          |
| `NAVIGATION_TIMEOUT`              | `30000`                                      | Page navigation timeout in milliseconds                                                               |
| `ACTION_TIMEOUT`                  | `15000`                                      | Browser action timeout in milliseconds                                                                |
| `PLAYWRIGHT_REPORT_DIRECTORY`     | `dist/test-report`                           | Root directory for reports and test artifacts                                                         |
| `PLAYWRIGHT_FAILURE_HISTORY_PATH` | `.playwright/failure-history.json`           | Persistent failure-history file                                                                       |

Boolean variables accept `true` or `false`; `CI` also accepts `1` or `0`.
Timeouts and worker counts must be positive integers.

## Test commands

| Command                          | Runs                                         |
| -------------------------------- | -------------------------------------------- |
| `npm test`                       | Chromium suite; type-checks first            |
| `npm run ci`                     | Type-check and Chromium suite                |
| `npm run test:regression`        | Full Chromium suite                          |
| `npm run test:e2e`               | UI specs in Chromium                         |
| `npm run test:api`               | API specs in Chromium                        |
| `npm run test:database`          | Database specs in Chromium                   |
| `npm run test:smoke`             | Tests tagged `@smoke` in Chromium            |
| `npm run test:sanity`            | Tests tagged `@sanity` in Chromium           |
| `npm run test:cross-browser`     | Chromium, Firefox, and WebKit                |
| `npm run test:debug`             | Chromium in Playwright debug mode            |
| `npm run test:flaky`             | Repeat each Chromium test twice              |
| `npm run typecheck`              | Type-check without emitting files            |
| `npm run reports:clean`          | Remove the default report output directory   |
| `npm run report:allure:generate` | Generate an Allure report without opening it |
| `npm run report:html`            | Open the latest Playwright HTML report       |
| `npm run report:allure`          | Generate and open the latest Allure report   |
| `npm run format:check`           | Check Prettier formatting                    |

External-service tests need valid credentials, network access, and an available
test environment. For example, `npm run test:api` requests a real OAuth token,
and `npm run test:database` connects to SQL Server.

## Reports and failure history

Each test run writes its reports beneath `dist/test-report` by default:

- `html-report/` — interactive Playwright HTML report.
- `allure-results/` — Allure input data; `allure-report/` is generated from it.
- `test-artifacts/` — traces, screenshots, and videos retained on failure.
- `summary.json` — machine-readable run summary.
- `aged-failures-dashboard.md` — run-wide Markdown dashboard of failed cases.

Open the latest Playwright report with `npm run report:html`. Generate and open
the Allure report with `npm run report:allure`. Failed tests include failure
history details and a dashboard attachment listing the complete failed-case
set for that run. The dashboard includes test location, project, age in whole
days, consecutive failed runs, and whether the failure is at least 30 days old.
Allure also displays failure-count and failure-age labels.

Failure streaks are persisted in `.playwright/failure-history.json`. A test
failure increments its streak; a passing or eventually-passing flaky result
clears it. Skipped and unselected tests do not reset history. The age is
elapsed whole days since the first failure in the current streak. Set
`PLAYWRIGHT_FAILURE_HISTORY_PATH` to store history elsewhere.

`npm run test:report` removes the current report directory and then type-checks
and runs Chromium tests. Use it when you want a clean local report.

## Docker

Docker Desktop and a configured `.env` file are required:

```sh
npm run docker:build
npm run docker:test
```

Docker Compose mounts `dist/test-report` and `.playwright` so reports and
failure history persist after the container exits. The image uses the
Playwright `v1.52.0-jammy` browser image and runs the `ci` npm script.

## GitHub Actions

Suite-specific workflows call `.github/workflows/playwright-suite.yml`:

- `api-test.yml` runs for pushes to `main`/`master` and manual dispatch.
- `smoke-test.yml` runs for pushes to `main`/`master` and manual dispatch.
- `e2e-test.yml` and `sanity-test.yml` run on manual dispatch.
- `regression-test.yml` runs on its daily schedule and manual dispatch.

Configure repository variables `ENVIRONMENT`, `COM_DOMAIN`, `CA_DOMAIN`,
`API_DOMAIN`, and `DB_PRIMARY_NAME`. Configure secrets `API_CLIENT_ID`,
`API_PASSWORD`, `DB_HOST`, `DB_USER`, and `DB_PASS` for the suites that need
them. The workflow restores and uploads per-suite failure history, publishes
the Playwright and Allure reports, and sends a summary email when SMTP
configuration is present. Email uses `SMTP_SERVER`, `SMTP_USERNAME`, and
`SMTP_PASSWORD` secrets; `SMTP_FROM`, `SMTP_PORT`, and `REPORT_EMAIL_TO` are
optional configuration.
