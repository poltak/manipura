# OpenClaw (Dev Setup)

This folder contains a sample OpenClaw gateway configuration that keeps the
gateway on the host while sandboxing tool execution in Docker. It also scopes
agent workspaces to a dedicated directory and restricts tools to memory + web.

## Quick Start
- Copy `openclaw.example.json` to your OpenClaw config location.
- Update the gateway auth token in your local config.
- Start the OpenClaw gateway using your normal OpenClaw workflow.

## App Environment
Configure the web app to talk to the gateway:
- `OPENCLAW_GATEWAY_URL`
- `OPENCLAW_GATEWAY_TOKEN`
- `OPENCLAW_AGENT_ID` (default: `main`)
