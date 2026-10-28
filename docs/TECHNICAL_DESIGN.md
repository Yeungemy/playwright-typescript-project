# Automation Framework Technical Design

## Purpose and scope

This project is a Playwright Test framework for authorized UI, API, and SQL
Server validation. It separates executable test cases from reusable browser
models, service clients, database access, fixtures, configuration, and data.
The framework favors Playwright's built-in worker, fixture, retry, trace, and
reporting lifecycles rather than maintaining parallel framework abstractions.

## Source layout

```text
src/
  config/       Environment validation and derived application/API URLs
  fixtures/     Composed Playwright fixtures for page, API, and database layers
  pages/
    api/        HTTP request client, OAuth token client, request/response types
    database/   SQL Server connection lifecycle and parameterized queries
    e2e/        Application page objects
  reporting/    Consecutive failure history and failed-case report attachments
  test-data/    Factories and static JSON fixtures
  tests/
    api/        API contract and authentication scenarios
    database/   Database connectivity and data scenarios
    e2e/        Browser scenarios
    reporting/  Failure-history behavior tests
    test-data/  Test-data factory behavior tests
```

### Dependency direction

- Tests may import fixtures, page objects, API clients, database utilities, and
  test data.
- Fixtures compose Playwright resources with clients and page objects.
- Tests use one namespaced fixture per resource category (`ui`, `api`, or
  `database`) rather than destructuring multiple unrelated fixtures. Playwright
  still injects that fixture into each test callback; global page or token
  state is intentionally avoided because it is unsafe with parallel workers.
- Resource fixtures remain lazy: requesting `ui` does not connect to SQL Server
  or fetch an API token, and API/database tests do not create browser pages
  unless they request the UI fixture.
- Page objects depend on Playwright's `Page`, not on test specs or service
  clients.
- API clients depend on Playwright's `APIRequestContext` and API contracts.
- Database utilities own SQL connections and parameterized query execution.
- Configuration is the single source for validated environment values.
- Production framework modules do not import test specs.

Avoid duplicated base tests, fixture barrels per test category, custom browser
singletons, SQL concatenation, and test data embedded in page objects. Add
shared behavior at the narrowest reusable layer.

## Execution and performance

Playwright owns browser and test lifecycles. Tests are isolated, parallelized
according to the Playwright worker setting, and use worker-scoped SQL pools
where database fixtures are requested. Set `WORKERS` to cap or raise worker
count. If it is unset, Playwright chooses its normal local default; CI defaults
to one worker for predictable resource usage.

The configured Chromium suite is the default (`npm test`). The optional
`npm run test:cross-browser` runs configured Chromium, Firefox, and WebKit
projects. CI workflows install Chromium only because the current CI suites run
Chromium. Keep network-dependent API, UI, and database tests tagged and
selectable so a focused suite does not initialize unrelated external fixtures.

Use the standard Playwright retry behavior only in CI. Traces, screenshots, and
videos are retained for failures; artifacts are placed beneath
`dist/test-report/test-artifacts`.

## Environment and secret handling

`src/config/environment.ts` validates configuration once at process startup.
Environment names containing `cwi`, or exactly `vonext`, select `COM_DOMAIN`;
other names select `CA_DOMAIN`. `API_URL` appends `API_DOMAIN` to `BASE_URL`.
Database names resolve the supported `${ENVIRONMENT}` placeholder.

Use `.env` only for local development; it is excluded from Git and Docker build
contexts. CI receives credentials from repository secrets and non-secret
settings from repository variables. Never print credentials or embed them in
test reports, images, or source.

## Reporting and failure streaks

Playwright's standard HTML report and Allure show failure metadata directly on
each failed test case:

- `dist/test-report/html-report/` — detailed Playwright report.
- `dist/test-report/allure-results/` — Allure input data.
- `dist/test-report/summary.json` — machine-readable run summary.
- `dist/test-report/test-artifacts/` — traces, screenshots, and videos.

Allure results are cleared at the start of each Playwright invocation so its
HTML report reflects only the latest run. Failure history remains separately
persisted. The report-generation command writes run status and test totals to
Allure environment metadata shown under Overview > Environment. For each failed
test, a `failure-history` attachment shows its test title, source location,
failure age in whole days, and consecutive failing-run count. A shared
**Aged failed cases dashboard** Markdown attachment is also available on each
failed test in both reports. It lists all failed cases in the run with source
location, project, age, consecutive failing-run count, and a 30-day aged
indicator. The custom reporter finalizes the completed dashboard after test execution so
parallel workers cannot leave an incomplete snapshot. The Allure post-
processing script adds the dashboard and `failure_count` and `failure_age`
labels to failed cases, then writes run totals to the environment metadata.
The native **Failed** filter in each report provides access to the case details;
there is no separate dashboard or report-page injection.

The reporter records only tests that actually ran. Subsequent failures update
the last-failed timestamp and consecutive run count; a pass or flaky (eventually
passing) result clears the active failure. Age is elapsed whole days since the
first failure in the current streak. Skipped and unselected tests do not reset
the streak.

Local history is `.playwright/failure-history.json`. Each GitHub workflow
restores its last completed same-branch history artifact, serializes runs for
that workflow/branch, and uploads the updated history. Artifact retention is
90 days for history and 30 days for reports. A first run without history starts
with an empty baseline.

## Docker

The Docker image uses the Playwright `v1.52.0-jammy` image corresponding to the
locked Playwright Test dependency. The image installs from `package-lock.json`,
uses the preinstalled browser/runtime dependencies, excludes local secrets and
build outputs from its context, and runs as the image's non-root `pwuser`.

Local Docker commands:

```sh
npm run docker:build
npm run docker:test
```

Open the latest locally generated Allure HTML report with:

```sh
npm run report:allure
```

`docker:test` uses Docker Compose, reads local `.env`, sets CI/headless mode,
and mounts report and failure-history directories so outputs survive container
exit. The `ci` npm script is the container's default command. Docker Desktop
and a configured `.env` are prerequisites.

## GitHub Actions

The suite-specific workflows keep their trigger policies and delegate execution
to `.github/workflows/playwright-suite.yml`. That reusable workflow owns locked
dependency installation, browser setup, type-checking, failure-history
restore/persist, suite selection, and report artifacts.

Configure repository variables `ENVIRONMENT`, `COM_DOMAIN`, `CA_DOMAIN`,
`API_DOMAIN`, and `DB_PRIMARY_NAME`; configure secrets `API_CLIENT_ID`,
`API_PASSWORD`, `DB_HOST`, `DB_USER`, and `DB_PASS` for suites that require
those services. A workflow referencing a secret that is not configured receives
an empty value; service-dependent tests then fail with an actionable
configuration error rather than silently skipping.

After each run, CI generates the Allure HTML report when Allure result files
exist. It adds run totals to Allure's environment metadata and failure streak
metadata to each failed test, then publishes Allure with the JSON summary.
The email includes the summary and per-test failure information and links to
the downloadable reports. Its recipient is `REPORT_EMAIL_TO` (default
`emyzheng80@gmail.com`), and the message includes the workflow-run link for
downloading complete artifacts. Configure `SMTP_SERVER`,
`SMTP_USERNAME`, and `SMTP_PASSWORD` as repository secrets; `SMTP_FROM` is
optional and defaults to `SMTP_USERNAME`, while `SMTP_PORT` defaults to 465.
Without SMTP credentials, the workflow explicitly warns that email was not
sent and still uploads the reports.
For Gmail SMTP, use `smtp.gmail.com` with port 465 or 587 and an app password.

## Verification

```sh
npm ci
npm run typecheck
npm test
npm run test:cross-browser
npm run format:check
docker compose config
docker compose build playwright
```

Run the Docker commands only where Docker Engine is available. Tests that call
external services additionally require authorized credentials and network
connectivity.
