import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = process.env;

describe("POST /api/mediate", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = ORIGINAL_ENV;
  });

  it("proxies to manipura-api when configured", async () => {
    process.env.MANIPURA_API_URL = "http://localhost:4000";

    fetchMock.mockResolvedValue({
      status: 200,
      json: async () => ({
        mediated: "I feel tense about this. Could we revisit it?",
        tone: "soften"
      })
    } as Response);

    const { POST } = await import("../../app/api/mediate/route");

    const request = new Request("http://localhost/api/mediate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "You never listen and I'm frustrated about this."
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/v1/mediate",
      expect.objectContaining({ method: "POST" })
    );

    const payload = await response.json();
    expect(payload.tone).toBe("soften");
  });

  it("falls back locally when manipura-api is unreachable", async () => {
    process.env.MANIPURA_API_URL = "http://localhost:4000";

    fetchMock.mockRejectedValueOnce(new Error("API offline"));

    const { POST } = await import("../../app/api/mediate/route");

    const request = new Request("http://localhost/api/mediate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "You never listen and I'm frustrated about this."
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload.tone).toBe("soften");
    expect(payload.mediated).toContain("sometimes");
  });

  it("returns 400 when the message is missing", async () => {
    const { POST } = await import("../../app/api/mediate/route");

    const request = new Request("http://localhost/api/mediate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: "" })
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const payload = await response.json();
    expect(payload.tone).toBe("clarify");
  });
});
