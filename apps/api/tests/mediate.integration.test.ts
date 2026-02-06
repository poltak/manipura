import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { once } from "node:events";
import type { AddressInfo } from "node:net";

import { startServer } from "../src/server";
import { defaultMediationEventsRepository } from "../src/db/repositories/mediation-events-repo";

describe("POST /v1/mediate integration", () => {
  let server: import("node:http").Server;
  let baseUrl = "";

  beforeEach(async () => {
    defaultMediationEventsRepository.reset();
    delete process.env.OPENCLAW_GATEWAY_URL;
    delete process.env.OPENCLAW_AGENT_ID;
    delete process.env.OPENCLAW_GATEWAY_TOKEN;

    server = startServer(0);
    await once(server, "listening");

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    defaultMediationEventsRepository.reset();
    delete process.env.OPENCLAW_GATEWAY_URL;
    delete process.env.OPENCLAW_AGENT_ID;
    delete process.env.OPENCLAW_GATEWAY_TOKEN;

    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  });

  it("writes an event on successful local mediation", async () => {
    const response = await fetch(`${baseUrl}/v1/mediate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "You never respond and I'm upset about this.",
        threadId: "thr_1",
        mode: "mediate"
      })
    });

    expect(response.status).toBe(200);

    const events = defaultMediationEventsRepository.list();
    expect(events).toHaveLength(1);
    expect(events[0].threadId).toBe("thr_1");
    expect(events[0].runtime).toBe("local");
    expect(events[0].fallbackReason).toBe("not_configured");
  });

  it("writes an event with fallback reason when OpenClaw request fails", async () => {
    process.env.OPENCLAW_GATEWAY_URL = "http://127.0.0.1:9";
    process.env.OPENCLAW_AGENT_ID = "main";

    const response = await fetch(`${baseUrl}/v1/mediate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "I'm frustrated and you never listen.",
        mode: "mediate"
      })
    });

    expect(response.status).toBe(200);

    const events = defaultMediationEventsRepository.list();
    expect(events).toHaveLength(1);
    expect(events[0].runtime).toBe("local");
    expect(events[0].fallbackReason).toBe("openclaw_error");
  });

  it("returns 400 and writes no event for malformed request body", async () => {
    const response = await fetch(`${baseUrl}/v1/mediate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{\"message\":"
    });

    expect(response.status).toBe(400);

    const events = defaultMediationEventsRepository.list();
    expect(events).toHaveLength(0);
  });
});
