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

test("the exhibit page is a sheet and the plain pages share the night floor", async ({ page }) => {
  const floor = (url: string) =>
    page.goto(url).then(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor));

  expect(await floor("/rooms/precursors/evt_history_overview")).toBe("rgb(7, 7, 13)");
  await expect(page.locator(".titleblock dt")).toHaveText(["Hall", "Years", "Kind", "Confidence"]);
  await expect(page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Precursors" })).toBeVisible();

  expect(await floor("/accuracy")).toBe("rgb(7, 7, 13)");
  expect(await floor("/changelog")).toBe("rgb(7, 7, 13)");
});

test("breadcrumbs on an exhibit lead back to the room and the timeline", async ({ page }) => {
  await page.goto("/rooms/precursors/evt_history_overview");
  const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(crumbs.locator("[aria-current='page']")).toHaveText(await page.getByRole("heading", { level: 1 }).innerText());
  await expect(crumbs.getByRole("link", { name: "Timeline" })).toHaveAttribute("href", "/");
  await crumbs.getByRole("link", { name: "Precursors" }).click();
  await expect(page).toHaveURL(/\/rooms\/precursors$/);
});

test("the site nav marks the current page", async ({ page }) => {
  const nav = page.getByRole("navigation", { name: "Site" });
  await page.goto("/atlas");
  await expect(nav.getByRole("link", { name: "Atlas" })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Timeline" })).not.toHaveAttribute("aria-current", "page");
  await page.goto("/changelog");
  await expect(nav.getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
  await page.goto("/rooms/symbolic");
  await expect(nav.getByRole("link", { name: "Timeline" })).toHaveAttribute("aria-current", "page");
});
