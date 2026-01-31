# Manipura - Project Documentation

## Vision
AI-mediated communication for couples to bridge linguistic and emotional gaps. Inspired by cross-cultural relationships (specifically English/Vietnamese) where literal translation often misses the emotional or cultural nuance.

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
- **Monorepo Architecture:** Managed as a single repository using a workspace-based approach (e.g., Turborepo or npm/pnpm workspaces).
    - `apps/bridge-web`: The SvelteKit/Tailwind user interface (the "Cockpit").
    - `packages/core`: Shared logic, types, and the "Mediator" prompt engine.
    - `packages/gateway`: The opinionated OpenClaw distribution (the "Engine").
    - `infra/vault`: Docker/Terraform configs for deploying isolated "Vault" instances.
- **The "Vault" Model:** Every couple receives a dedicated, isolated Docker container ("The Vault") for their data and LLM context, ensuring logical separation and a path to user-owned hosting.
- **Prototype Interface:** SvelteKit-based web application integrating with LLMs via context-aware "Mediator" prompts.

