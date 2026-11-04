import { expect, test } from "@playwright/test";

test("the home is one timeline of era bands whose chips open the exhibit in its room", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Hall of Eras" })).toBeVisible();
  await expect(page.locator("video, canvas")).toHaveCount(0);
  const founding = page.getByRole("region", { name: "Formal founding" });
  await expect(founding).toBeVisible();
  expect(await page.locator(".tl-band").count()).toBeGreaterThan(5);
  const chip = founding.getByRole("link", { name: /Dartmouth Summer Research Project/ });
  await expect(chip).toHaveAttribute("href", "/rooms/founding#evt_1956_dartmouth");
  await chip.click();
  await expect(page).toHaveURL(/\/rooms\/founding#evt_1956_dartmouth$/);
});

test("the search box filters exhibit chips by title", async ({ page }) => {
  await page.goto("/");
  const search = page.getByLabel("Search exhibits");
  await search.fill("dartmouth");
  await expect(page.locator(".tl-chips a")).toHaveCount(1);
  await expect(page.getByRole("link", { name: /Dartmouth Summer Research Project/ })).toBeVisible();
  await expect(page.getByRole("region", { name: "Formal founding" })).toBeVisible();
  await expect(page.locator("#era-precursors")).toBeHidden();
  await expect(page.getByRole("status")).toHaveText("");
  await search.fill("no such exhibit anywhere");
  await expect(page.getByText(/No exhibits match/)).toBeVisible();
  await expect(page.locator(".tl-chips a")).toHaveCount(0);
});

test("the year rail links to each era band on wide screens", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const rail = page.getByRole("navigation", { name: "Eras" });
  await expect(rail).toBeVisible();
  await rail.locator("a[href='#era-statistical']").click();
  await expect(page).toHaveURL(/#era-statistical$/);
  await expect(rail.locator("a[href='#era-statistical']")).toHaveAttribute("aria-current", "location");
});
