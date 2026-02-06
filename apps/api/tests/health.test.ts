import { describe, expect, it } from "vitest";

import { handleHealth } from "../src/routes/health";

describe("GET /health", () => {
  it("returns health payload", () => {
    const result = handleHealth();

    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      ok: true,
      service: "manipura-api"
    });
  });
});
