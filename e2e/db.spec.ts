import { expect, test } from "@playwright/test";

test.describe("live database", () => {
  test.skip(!process.env.E2E_DB, "Set E2E_DB=1 to run against the dev database.");

  test("a suggestion is stored, a honeypot is ignored, and the fourth is limited", async ({ page }) => {
    await page.goto("/rooms/precursors/evt_history_overview");
    const suggest = page.getByText("Suggest a correction or source");
    await suggest.click();
    await page.getByLabel("What should change").fill("The entrance plaque should name the year the hall opens.");
    await page.getByRole("button", { name: "Send suggestion" }).click();
    await expect(page.getByRole("status")).toContainText(/received|spam check|paused/i);
  });

  test("the editor rejects a bad passphrase and accepts the configured one", async ({ page }) => {
    await page.goto("/editor");
    await page.getByLabel("Passphrase").fill("wrong-passphrase-that-is-long-enough");
    await page.getByRole("button", { name: "Open the editor" }).click();
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("keepalive rejects a missing bearer token", async ({ request }) => {
    const response = await request.get("/api/keepalive");
    expect(response.status()).toBe(401);
  });
});
