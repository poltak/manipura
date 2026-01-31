# Manipura - Project Documentation

## Vision
AI-mediated communication for couples to bridge linguistic and emotional gaps. Inspired by cross-cultural relationships (specifically English/Vietnamese) where literal translation often misses the emotional or cultural nuance.

## Install & Run
- From repo root:
  - Install dependencies: `npm install`
  - Run the web app: `npm run dev`
  - Run unit tests: `npm run test:unit`
  - Run all tests (unit + e2e): `npm run test`

## Core Features & Philosophy

### 1. Meaning Extraction (The "Unified Decoder")
- Treating **Linguistic Translation** and **Intent Interpretation** as the same fundamental task.
- **Same-Language Translation:** "Decoding" messages within the same language to find different interpretations or to "soften" the delivery (e.g., from "Frustrated English" to "Constructive English").
- **Cross-Language Nuance:** Moving beyond literal word-swapping to capture the underlying sentiment and cultural weight of phrases.

### 2. The "Unified Stream" Interface
- **Minimalist UI:** Avoiding a "cockpit" of separate buttons. The primary interaction is a natural chat.
- **Dynamic Prompting:** Switching between mediation, translation, and check-in modes automatically based on message context.
- **Optional Insights:** Subtle UI elements (toggles or icons) to reveal the "AI interpretation" without cluttering the main conversation flow.

### 3. Mediation & Proactivity
- **Cooling-Off Buffer:** Detecting high-arousal or aggressive language and suggesting a "pause" or a "rephrase" before delivery.
- **Proactive Check-ins:** Structured pings (e.g., the current 10:30 AM / 5:00 PM routine) to foster consistency and shared context.
- **Shared Memory:** Maintaining a "Relationship Context" (preferences, recurring patterns, support needs) accessible to both partners' AI instances.

## Technical Goals
- **Monorepo Architecture:** Managed as a single repository using `pnpm` workspaces (optionally Turborepo once CI exists).
    - `apps/bridge-web`: Next.js (React) + Tailwind + Lucide React UI (the "Cockpit").
    - `apps/api`: Lightweight API (Fastify or Hono) for auth, messaging, and mediation.
    - `packages/core`: Shared logic, types, and the "Mediator" prompt engine.
    - `packages/llm`: Provider abstraction and prompt templates.
    - `infra/vault`: Docker/Terraform configs for deploying isolated "Vault" instances (phase 2+).
- **The "Vault" Model (Revised):** Treat the Vault as a *logical namespace* first (strict tenancy + encryption), then graduate to per-couple containers for user-owned hosting. This keeps the prototype shippable without heavy infra while preserving the long-term isolation promise.
- **Data & Memory:** Postgres + pgvector (or SQLite + vector extension for local dev) to store message history, relationship context, and embeddings for recall.
- **Prototype Interface:** Next.js-based web app integrating with LLMs via context-aware "Mediator" prompts and a single shared "Unified Stream."
- **Operational Goals:** Audit logs for all mediated transforms; explicit user consent boundaries; exportable vault data for portability.

## Prototype Scope (Phase 0)
- Single deployment with strict per-couple tenancy keys and optional end-to-end encryption.
- One shared conversation view with mediation suggestions (rephrase, soften, clarify intent).
- Basic check-ins (scheduled via cron/worker) and a minimal "relationship context" editor.
- Provider-agnostic LLM layer (OpenAI/Anthropic/local) behind a single interface.
