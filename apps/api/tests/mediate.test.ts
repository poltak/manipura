import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handleMediate } from "../src/routes/mediate";

describe("POST /v1/mediate", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.OPENCLAW_GATEWAY_URL;
    delete process.env.OPENCLAW_AGENT_ID;
    delete process.env.OPENCLAW_GATEWAY_TOKEN;
  });

  it("returns a mediated response from OpenClaw when configured", async () => {
    process.env.OPENCLAW_GATEWAY_URL = "http://openclaw.test";
    process.env.OPENCLAW_AGENT_ID = "main";

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                mediated: "I feel tense about this. Could we revisit it?",
                tone: "soften"
              })
            }
          }
        ]
      })
    } as Response);

    const result = await handleMediate({
      message: "You never listen and I'm frustrated about this.",
      mode: "mediate"
    });

    expect(result.status).toBe(200);
    expect(result.body.tone).toBe("soften");
    expect(result.body.mediated).toContain("I feel tense about this.");
  });

  it("falls back to the local mediator when OpenClaw fails", async () => {
    process.env.OPENCLAW_GATEWAY_URL = "http://openclaw.test";
    process.env.OPENCLAW_AGENT_ID = "main";

    fetchMock.mockRejectedValueOnce(new Error("OpenClaw offline"));

    const result = await handleMediate({
      message: "You never listen and I'm frustrated about this.",
      mode: "mediate"
    });

    expect(result.status).toBe(200);
    expect(result.body.tone).toBe("soften");
    expect(result.body.mediated).toContain("sometimes");
  });

  it("returns 400 when message is missing", async () => {
    const result = await handleMediate({ message: "" });

    expect(result.status).toBe(400);
    expect(result.body.tone).toBe("clarify");
  });
});
