import { expect, test } from "@playwright/test";

test("symbolic names an exhibit and has no video", async ({ page }) => {
  await page.goto("/rooms/symbolic");
  await expect(page.getByRole("heading", { level: 1, name: "Rosenblatt's Perceptron" })).toBeVisible();
  await expect(page.locator("video")).toHaveCount(0);
});

test("founding and frontier are different rooms and the home stays dark", async ({ page }) => {
  await page.goto("/rooms/founding");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Turing's imitation game");
  await page.goto("/rooms/frontier");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Statement on AI Risk");
  await page.goto("/");
  await expect(page.locator(".night")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hall of Eras" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Enter the hall" }).first()).toHaveAttribute("href", "/rooms/precursors");
});

test("previous and next era switch the hall, the URL and the breadcrumb without a reload", async ({ page }) => {
  await page.goto("/rooms/symbolic");
  const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(crumbs.locator("[aria-current='page']")).toHaveText("Symbolic golden age");
  await page.evaluate(() => ((window as unknown as { __kept: boolean }).__kept = true));
  // Hydration must finish before the click is handled, and a click is not safe to retry.
  const next = page.getByRole("button", { name: "Next era: First AI winter" });
  await expect
    .poll(() => next.evaluate((el) => Object.keys(el).some((key) => key.startsWith("__reactProps"))))
    .toBe(true);
  await next.click();
  await expect(page).toHaveURL(/\/rooms\/first-winter$/);
  await expect(crumbs.locator("[aria-current='page']")).toHaveText("First AI winter");
  await page.getByRole("button", { name: "Previous era: Symbolic golden age" }).click();
  await expect(page).toHaveURL(/\/rooms\/symbolic$/);
  expect(await page.evaluate(() => (window as unknown as { __kept?: boolean }).__kept)).toBe(true);
});

test("the first era has no previous button and the provisional hall stays reachable", async ({ page }) => {
  await page.goto("/rooms/precursors");
  await expect(page.getByRole("button", { name: /^Next era:/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Previous era:/ })).toHaveCount(0);
  await page.goto("/rooms/frontier");
  await expect(page.getByRole("button", { name: "Next era: Provisional hall" })).toBeEnabled();
});

test("an era with no confirmed exhibit has no room and no band", async ({ page }) => {
  for (const slug of ["expert-systems", "second-winter"]) {
    const response = await page.goto(`/rooms/${slug}`);
    expect(response?.status()).toBe(404);
  }
  await page.goto("/");
  await expect(page.locator("#era-expert-systems, #era-second-winter")).toHaveCount(0);
  await page.goto("/rooms/first-winter");
  await expect(page.getByRole("button", { name: "Next era: Statistical renaissance" })).toBeVisible();
});

test("the changelog names each withdrawn exhibit, with its date and reason", async ({ page }) => {
  await page.goto("/changelog");
  const line = page.locator(".changelog li", { hasText: "LISP-machine market collapse" }).first();
  await expect(line).toContainText("Withdrawn: No primary record was found.");
  await expect(line.locator("time")).toHaveText(/^\d{4}-\d{2}-\d{2}$/);
  await expect(line.getByRole("link")).toHaveCount(0);
});
