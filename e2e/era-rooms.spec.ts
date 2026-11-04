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

test("switching hall updates the URL without a reload and the breadcrumb follows", async ({ page }) => {
  await page.goto("/rooms/symbolic");
  const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(crumbs.locator("[aria-current='page']")).toHaveText("Symbolic golden age");
  await page.evaluate(() => ((window as unknown as { __kept: boolean }).__kept = true));
  // Hydration must finish before the click is handled.
  await expect(async () => {
    await page.getByRole("button", { name: /Expert systems boom/ }).click();
    await expect(page).toHaveURL(/\/rooms\/expert-systems$/, { timeout: 500 });
  }).toPass();
  await expect(crumbs.locator("[aria-current='page']")).toHaveText("Expert systems boom");
  expect(await page.evaluate(() => (window as unknown as { __kept?: boolean }).__kept)).toBe(true);
});
