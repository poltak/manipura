import { describe, expect, it } from "vitest";

import { POST } from "../../app/api/mediate/route";

describe("POST /api/mediate", () => {
  it("returns a mediated response", async () => {
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
