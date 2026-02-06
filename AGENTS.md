# AGENTS.md

## Working agreements
- Always run `npm test` from repo root after modifying JavaScript/TypeScript files.
- Prefer `npm` when installing dependencies.
- Ask for confirmation before adding new production dependencies.
- Add test coverage whenever adding new features.

## Dev Flow (Testing First)
- Add or update tests with every feature change or bug fix.
- Core logic: keep unit tests in `packages/core/tests` and run `npm run test:unit` from `packages/core`.
- LLM adapters: keep unit tests in `packages/llm/tests` and run `npm run test:unit` from `packages/llm`.
- API service: keep unit tests in `apps/api/tests` and run `npm run test:unit` from `apps/api`.
- Web app: keep unit tests in `apps/bridge-web/tests` and run `npm run test:unit` from `apps/bridge-web`.
- E2E coverage: add Playwright specs in `apps/bridge-web/tests/e2e` and run `npm run test:e2e` from `apps/bridge-web`.
