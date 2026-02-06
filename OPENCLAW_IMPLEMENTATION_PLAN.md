# Manipura OpenClaw Implementation Plan

This document defines the concrete build plan for turning the current prototype into a production-oriented architecture that uses OpenClaw as the mediation execution engine.

## 1) Current Baseline (already in repo)

- Web prototype exists: `apps/bridge-web`.
- Mediation endpoint exists in web app route: `apps/bridge-web/app/api/mediate/route.ts`.
- Local fallback mediator exists: `packages/core/src/mediator.ts`.
- OpenClaw adapter exists: `packages/llm/src/openclaw.ts`.
- Prompt builder and parser exist: `packages/core/src/prompts.ts`, `packages/llm/src/parse.ts`.
- Unit and E2E tests exist for current flow.

## 2) Target Architecture

- `apps/bridge-web`: frontend only (UI, auth session handling, user interactions).
- `apps/api`: product backend (authn/authz, tenancy, persistence, audit, scheduler APIs).
- `packages/core`: shared domain contracts, prompt/policy logic, guards.
- `packages/llm`: runtime adapters (`openclaw` first, additional providers later).
- OpenClaw gateway: isolated mediation execution with constrained tools and sandboxing.

## 3) Backend (`apps/api`) folder layout

```txt
apps/api/
  src/
    server.ts
    config.ts
    routes/
      health.ts
      mediate.ts
      context.ts
      threads.ts
      checkins.ts
      export.ts
    middleware/
      auth.ts
      tenancy.ts
      request-id.ts
      rate-limit.ts
    services/
      mediation-service.ts
      openclaw-service.ts
      context-service.ts
      audit-service.ts
      checkin-service.ts
    db/
      client.ts
      migrations/
      repositories/
        users-repo.ts
        couples-repo.ts
        messages-repo.ts
        mediation-events-repo.ts
        context-repo.ts
    validation/
      mediate-schema.ts
      context-schema.ts
      checkin-schema.ts
    workers/
      checkin-worker.ts
```

## 4) Data model (minimum v1)

- `users`: user account identity.
- `couples`: tenant root (one couple = one namespace).
- `memberships`: user-to-couple mapping + roles.
- `threads`: conversation containers.
- `messages`: source and mediated messages.
- `mediation_events`: full transform/audit record.
- `relationship_context`: editable context profile (needs, style, recurring issues).
- `checkin_jobs`: scheduled check-ins.

Required indexing rules:

- Every tenant table includes `couple_id`.
- Composite indexes include `couple_id` first (for strict tenant scoping and query speed).
- Unique keys scoped by `couple_id` where applicable.

## 5) API contract (v1)

### `POST /v1/mediate`

Request:

```json
{
  "threadId": "thr_123",
  "message": "You never listen to me.",
  "mode": "mediate"
}
```

Response:

```json
{
  "mediated": "I feel unheard right now and want us to reconnect.",
  "tone": "soften",
  "alternatives": [
    "I want to feel understood when we discuss this.",
    "Can we revisit this so I feel heard?"
  ],
  "riskFlags": ["high-arousal"],
  "eventId": "evt_123"
}
```

Behavior:

- Validate body schema.
- Enforce user membership for `threadId` and `couple_id`.
- Resolve relationship context + short memory window.
- Call OpenClaw (or fallback) with strict JSON contract.
- Validate response schema.
- Persist message + mediation event atomically.
- Return safe result to client.

### `GET /v1/threads/:id/messages`

- Returns thread messages scoped to current `couple_id`.

### `GET /v1/context`
### `PUT /v1/context`

- Read/update relationship context for current `couple_id`.

### `POST /v1/checkins`

- Creates check-in schedule configuration.

### `GET /v1/export`

- Exports tenant-scoped data package (messages, events, context).

## 6) OpenClaw integration contract

OpenClaw request payload must include:

- locked system prompt from `packages/core`.
- explicit JSON output requirement.
- tool policy metadata (allowed tools only).
- trace metadata (`request_id`, `couple_id`, `thread_id`, policy version).

OpenClaw response must parse into:

```ts
type MediationOutput = {
  mediated: string;
  tone: "neutral" | "soften" | "clarify";
  alternatives?: string[];
  riskFlags?: string[];
};
```

If parse/validation fails:

- record failure reason in `mediation_events`.
- return fallback mediator output with `tone` and no unsafe leakage.

## 7) Security and tenancy rules

- All reads/writes filtered by `couple_id`.
- No route may infer tenant from client payload alone; derive from auth + membership.
- Encrypt sensitive message payloads at rest.
- Keep audit trail immutable (append-only `mediation_events`).
- Include policy version and model runtime version in each event.

## 8) Audit event shape

```json
{
  "id": "evt_123",
  "coupleId": "cpl_123",
  "threadId": "thr_123",
  "actorUserId": "usr_123",
  "inputHash": "sha256:...",
  "outputHash": "sha256:...",
  "tone": "soften",
  "riskFlags": ["high-arousal"],
  "policyVersion": "2026-02-06.1",
  "runtime": "openclaw:main",
  "createdAt": "2026-02-06T10:00:00.000Z"
}
```

## 9) Phased execution plan

### Phase 1: API bootstrap and migration

- Create `apps/api` with health route and shared error envelope.
- Add DB client + first migrations for `users/couples/memberships/threads/messages/mediation_events`.
- Move mediation route logic from web app to API service.
- Update web app to call `apps/api` instead of local route.

Exit criteria:

- Existing mediation UI works end-to-end through `apps/api`.
- Existing tests updated and passing.

### Phase 2: Tenancy, context, and hardening

- Add auth middleware and membership-based tenancy guard.
- Add `GET/PUT /v1/context`.
- Add strict schema validation for all route inputs/outputs.
- Add OpenClaw failure taxonomy + fallback behavior with auditable reasons.

Exit criteria:

- Every route enforces `couple_id` scope.
- Mediation events include trace + policy metadata.

### Phase 3: Check-ins and exports

- Add check-in job model + worker.
- Add `/v1/checkins` and scheduled prompts using same mediation pipeline.
- Add `/v1/export` with tenant-scoped data export.

Exit criteria:

- Check-ins can be configured and delivered.
- Couple data export works and is auditable.

## 10) Testing strategy

- Unit tests:
  - contract/schema validation.
  - tenancy guard behavior.
  - OpenClaw parse/fallback logic.
- Integration tests:
  - `POST /v1/mediate` writes messages + events transactionally.
  - unauthorized cross-tenant access is rejected.
- E2E tests:
  - web message send -> mediated response rendered.
  - fallback behavior when OpenClaw is unavailable.

## 11) Immediate next implementation steps

1. Scaffold `apps/api` with `health` and `POST /v1/mediate`.
2. Add database migrations for v1 schema and repository layer.
3. Move current mediation orchestration into `apps/api/src/services/mediation-service.ts`.
4. Update `apps/bridge-web` to call `apps/api` endpoint.
5. Add integration tests around `POST /v1/mediate` with success/fallback paths.

## 12) Progress tracking checklist

- [ ] `apps/api` scaffolded and running.
- [ ] `/v1/mediate` migrated from web route.
- [ ] v1 tables + migrations added.
- [ ] tenancy guard enforced for all API routes.
- [ ] mediation events persisted with policy/runtime metadata.
- [ ] relationship context endpoints shipped.
- [ ] check-in scheduler shipped.
- [ ] export endpoint shipped.
