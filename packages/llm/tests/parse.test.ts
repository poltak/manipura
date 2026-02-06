import { describe, expect, it } from "vitest";

import { parseMediationOutput } from "../src/parse";

describe("parseMediationOutput", () => {
  it("parses plain JSON", () => {
    const result = parseMediationOutput(
      JSON.stringify({ mediated: "Hello.", tone: "neutral" })
    );

    expect(result).toEqual({ mediated: "Hello.", tone: "neutral" });
  });

  it("parses JSON inside a code fence", () => {
    const result = parseMediationOutput(
      "```json\n" +
        JSON.stringify({ mediated: "Thanks for sharing.", tone: "soften" }) +
        "\n```"
    );

    expect(result).toEqual({
      mediated: "Thanks for sharing.",
      tone: "soften"
    });
  });
});
