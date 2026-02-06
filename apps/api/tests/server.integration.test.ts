import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { once } from "node:events";
import type { AddressInfo } from "node:net";

import { startServer } from "../src/server";

describe("server integration", () => {
  let server: import("node:http").Server;
  let baseUrl = "";

  beforeEach(async () => {
    server = startServer(0);
    await once(server, "listening");

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
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

  it("returns X-Request-Id header for health endpoint", async () => {
    const response = await fetch(`${baseUrl}/health`);

    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toMatch(/^req_/);
  });

  it("echoes incoming request id on not found envelope", async () => {
    const response = await fetch(`${baseUrl}/nope`, {
      headers: {
        "x-request-id": "req_custom_123"
      }
    });

    expect(response.status).toBe(404);
    expect(response.headers.get("x-request-id")).toBe("req_custom_123");

    const payload = (await response.json()) as {
      error: { code: string; requestId: string };
    };

    expect(payload.error.code).toBe("NOT_FOUND");
    expect(payload.error.requestId).toBe("req_custom_123");
  });
});
