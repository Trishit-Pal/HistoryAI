import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("an exhibit page keeps its sources and its two histories", async ({ page }) => {
  await page.goto("/rooms/precursors");
  await expect(page.getByText("Ask the museum")).toHaveCount(0);
  await page.getByRole("button", { name: /Precursors/ }).click();
  await page.getByRole("link", { name: "Full exhibit, sources and changes" }).click();
  await expect(page).toHaveURL(/\/rooms\/precursors\/evt_history_overview/);
  await expect(page.getByRole("heading", { name: "Sources" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "How the field changed" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Revision history" })).toBeVisible();
  await expect(page.getByText(/Showing the archived copy from/)).toBeVisible();
  const accessibility = await new AxeBuilder({ page }).analyze();
  const blocking = accessibility.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );
  expect(blocking).toEqual([]);
});

test("a wrong era redirects and an unknown exhibit is missing", async ({ page }) => {
  await page.goto("/rooms/founding/evt_history_overview");
  await expect(page).toHaveURL(/\/rooms\/precursors\/evt_history_overview/);
  const missing = await page.goto("/rooms/precursors/not_a_real_exhibit");
  expect(missing?.status()).toBe(404);
});

test("the exhibit page is a sheet and the plain pages keep the stone floor", async ({ page }) => {
  const floor = (url: string) =>
    page.goto(url).then(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor));

  expect(await floor("/rooms/precursors/evt_history_overview")).toBe("rgb(14, 42, 71)");
  await expect(page.locator(".titleblock dt")).toHaveText(["Hall", "Years", "Kind", "Confidence"]);
  await expect(page.getByRole("link", { name: /^Back to / })).toBeVisible();

  expect(await floor("/accuracy")).toBe("rgb(26, 24, 20)");
  expect(await floor("/changelog")).toBe("rgb(26, 24, 20)");
});
