import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handleMediate } from "../src/routes/mediate";
import type { ApiRepositories } from "../src/db/repositories";

function createRepositoriesMock(): ApiRepositories {
  return {
    mediationEvents: {
      create: vi.fn().mockResolvedValue({
        id: "evt_test",
        createdAt: new Date().toISOString()
      })
    }
  };
}

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

  it("returns a mediated response from OpenClaw and writes an event", async () => {
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

    const repositories = createRepositoriesMock();

    const result = await handleMediate(
      {
        message: "You never listen and I'm frustrated about this.",
        threadId: "thr_123",
        mode: "mediate"
      },
      repositories
    );

    expect(result.status).toBe(200);
    expect(result.body.tone).toBe("soften");
    expect(result.body.mediated).toContain("I feel tense about this.");
    expect(repositories.mediationEvents.create).toHaveBeenCalledTimes(1);
    expect(repositories.mediationEvents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: "thr_123",
        runtime: "openclaw",
        fallbackReason: null,
        tone: "soften"
      })
    );
  });

  it("falls back to local mediator and writes fallback reason", async () => {
    process.env.OPENCLAW_GATEWAY_URL = "http://openclaw.test";
    process.env.OPENCLAW_AGENT_ID = "main";

    fetchMock.mockRejectedValueOnce(new Error("OpenClaw offline"));

    const repositories = createRepositoriesMock();

    const result = await handleMediate(
      {
        message: "You never listen and I'm frustrated about this.",
        mode: "mediate"
      },
      repositories
    );

    expect(result.status).toBe(200);
    expect(result.body.tone).toBe("soften");
    expect(result.body.mediated).toContain("sometimes");
    expect(repositories.mediationEvents.create).toHaveBeenCalledTimes(1);
    expect(repositories.mediationEvents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        runtime: "local",
        fallbackReason: "openclaw_error"
      })
    );
  });

  it("returns 400 and writes nothing when message is missing", async () => {
    const repositories = createRepositoriesMock();

    const result = await handleMediate({ message: "" }, repositories);

    expect(result.status).toBe(400);
    expect(result.body.tone).toBe("clarify");
    expect(repositories.mediationEvents.create).not.toHaveBeenCalled();
  });

  it("returns 400 and writes nothing for malformed message payload", async () => {
    const repositories = createRepositoriesMock();

    const result = await handleMediate(
      { message: 42 as unknown as string },
      repositories
    );

    expect(result.status).toBe(400);
    expect(repositories.mediationEvents.create).not.toHaveBeenCalled();
  });
});
