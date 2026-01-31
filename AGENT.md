# AGENT.md

## Dev Flow (Testing First)
- Add or update tests with every feature change or bug fix.
- Core logic: keep unit tests in `packages/core/tests` and run `npm run test:unit` from `packages/core`.
- Web app: keep unit tests in `apps/bridge-web/tests` and run `npm run test:unit` from `apps/bridge-web`.
- E2E coverage: add Playwright specs in `apps/bridge-web/tests/e2e` and run `npm run test:e2e` from `apps/bridge-web`.
