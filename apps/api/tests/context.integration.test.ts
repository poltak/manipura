import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { once } from "node:events";
import type { AddressInfo } from "node:net";

import { startServer } from "../src/server";
import { defaultContextRepository } from "../src/db/repositories/context-repo";

describe("/v1/context integration", () => {
  let server: import("node:http").Server;
  let baseUrl = "";

  beforeEach(async () => {
    defaultContextRepository.reset();

    server = startServer(0);
    await once(server, "listening");

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    defaultContextRepository.reset();

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

  it("returns default context for a couple", async () => {
    const response = await fetch(`${baseUrl}/v1/context`, {
      headers: {
        "x-couple-id": "cpl_a"
      }
    });

    expect(response.status).toBe(200);

    const payload = (await response.json()) as {
      communicationStyle: string;
      preferences: string[];
      triggers: string[];
    };

    expect(payload.communicationStyle).toBe("neutral");
    expect(payload.preferences).toEqual([]);
    expect(payload.triggers).toEqual([]);
  });

  it("updates and isolates context by couple", async () => {
    const put = await fetch(`${baseUrl}/v1/context`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-couple-id": "cpl_a"
      },
      body: JSON.stringify({
        communicationStyle: "gentle",
        preferences: ["reflective listening"],
        triggers: ["interruption"]
      })
    });

    expect(put.status).toBe(200);

    const updated = await fetch(`${baseUrl}/v1/context`, {
      headers: {
        "x-couple-id": "cpl_a"
      }
    });
    const updatedPayload = (await updated.json()) as { communicationStyle: string };

    expect(updatedPayload.communicationStyle).toBe("gentle");

    const otherCouple = await fetch(`${baseUrl}/v1/context`, {
      headers: {
        "x-couple-id": "cpl_b"
      }
    });
    const otherPayload = (await otherCouple.json()) as { communicationStyle: string };

    expect(otherPayload.communicationStyle).toBe("neutral");
  });

  it("rejects invalid context payload", async () => {
    const response = await fetch(`${baseUrl}/v1/context`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-couple-id": "cpl_a"
      },
      body: JSON.stringify({
        preferences: ["ok", 3]
      })
    });

    expect(response.status).toBe(400);

    const payload = (await response.json()) as { error: string };
    expect(payload.error).toContain("Invalid context payload");
  });
});
