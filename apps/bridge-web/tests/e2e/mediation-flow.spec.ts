import { expect, test } from "@playwright/test";

test("mediation flow returns softened response", async ({ page }) => {
  await page.goto("/");

  const message = "I'm upset you never respond.";
  await page.getByPlaceholder("Share the message you want mediated...").fill(message);
  await page.getByRole("button", { name: /send/i }).click();

  await expect(page.getByText(message)).toBeVisible();
  await expect(page.getByText(/I feel tense about this\./)).toBeVisible();
  await expect(page.getByText(/sometimes/)).toBeVisible();
  await expect(page.getByText(/soften tone/i)).toBeVisible();
});
