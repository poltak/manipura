import { describe, expect, it } from "vitest";

import { mediateMessage } from "../src/mediator";

describe("mediateMessage", () => {
  it("softens charged language and shifts tone", () => {
    const result = mediateMessage(
      "You never listen and I'm frustrated about this conversation today."
    );

    expect(result.tone).toBe("soften");
    expect(result.mediated).toContain("I feel tense about this.");
    expect(result.mediated).toContain("sometimes");
  });

  it("asks for clarification on short messages", () => {
    const result = mediateMessage("Hi");

    expect(result.tone).toBe("clarify");
    expect(result.mediated).toContain(
      "Could you share a bit more context so I can understand?"
    );
  });
});
