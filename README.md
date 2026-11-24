# Playwright Shopping Assignment

This project covers all twelve requested Automation Exercise scenarios with Playwright and TypeScript. The requested numbering maps to the site's published cases 1, 2, 4, 8, 10, 12, 14, 17, 18, 22, 25, and 19.

The suite contains exactly thirteen tests:

- one inline `toMatchAriaSnapshot()` test, listed first (no YAML snapshot/report files);
- twelve independent functional tests, one for each requested case.

Page objects contain locators and actions only. All assertions remain in the spec and use `expect.soft()`.
Custom fixtures in `fixtures/page-fixtures.ts` create the page objects and test data for each test. The hooks and test receive them as arguments, so page objects do not need to be constructed in the spec.

## Run

```bash
npm install
npx playwright install chromium
npm test
```

Run the functional tests with `npm run test:functional`, or the snapshot test with `npm run test:aria`. To run one case, use for example `npx playwright test --grep "Test Case 6:"`.

Each test run generates an HTML report in `playwright-report/`. Open the latest report with:

```bash
npm run report
```

The report includes test results and any saved failure screenshots, videos, or traces. Each run replaces the previous report.
