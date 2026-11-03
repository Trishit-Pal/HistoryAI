import { expect, test } from "@playwright/test";

test("the dark home lists a hall and opens Dartmouth", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Hall of Eras" })).toBeVisible();
  await expect(page.locator("video")).toHaveCount(0);
  await page.getByRole("button", { name: "Dartmouth Summer Research Project on Artificial Intelligence" }).click();
  await page.getByRole("link", { name: "Full exhibit" }).click();
  await expect(page).toHaveURL(/\/rooms\/founding\/evt_1956_dartmouth/);
  await expect(page.getByRole("heading", { name: "How the field changed" })).toBeVisible();
  await page.goto("/");
  const hero = await page.locator(".night-hero").boundingBox();
  const cloud = await page.locator(".night-hero canvas").boundingBox();
  expect(hero && cloud && cloud.height).toBeGreaterThan((hero?.height ?? 0) * 0.8);
});
