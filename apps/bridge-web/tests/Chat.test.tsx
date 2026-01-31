import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Chat from "../components/Chat";

describe("Chat", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends a message and renders the mediated response", async () => {
    fetchMock.mockResolvedValue({
      json: async () => ({
        mediated: "I feel tense about this. It feels like we missed a reply.",
        tone: "soften"
      })
    } as Response);

    render(<Chat />);
    const user = userEvent.setup();

    const textarea = screen.getByPlaceholderText(
      "Share the message you want mediated..."
    );
    await user.type(textarea, "I'm upset you never respond.");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, options] = fetchMock.mock.calls[0];
    expect(options?.method).toBe("POST");
    expect(String(options?.body)).toContain("I'm upset you never respond.");

    expect(
      await screen.findByText(
        "I feel tense about this. It feels like we missed a reply."
      )
    ).toBeVisible();
    expect(screen.getByText("soften tone")).toBeVisible();
  });

  it("shows a fallback message when mediation fails", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network error"));

    render(<Chat />);
    const user = userEvent.setup();

    const textarea = screen.getByPlaceholderText(
      "Share the message you want mediated..."
    );
    await user.type(textarea, "Can we talk?");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(
      await screen.findByText(
        "I had trouble reaching the mediation service. Try again in a moment."
      )
    ).toBeVisible();
  });
});
