import { expect, test } from "@playwright/test";

// SwiftShader gives headless Chromium WebGL, so the shelf canvas mounts.
test.use({
  viewport: { width: 1440, height: 900 },
  launchOptions: { args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] },
});

test("the year dial snaps to an artefact, names it and links to its room", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const dial = page.getByRole("slider", { name: "Choose an era by year" });
  await expect(dial).toHaveAttribute("aria-valuetext", /^1843, /);
  await expect(page.locator(".dial-stage canvas")).toHaveCount(1);
  await expect(page.locator("canvas")).toHaveCount(1);

  await dial.fill("1990");
  await expect(dial).toHaveValue("1997");
  await expect(dial).toHaveAttribute("aria-valuetext", /^1997, .*Deep Blue/);
  await expect(page.locator(".dial-label")).toContainText("1997 ·");
  const visit = page.getByRole("link", { name: /^Visit .*Deep Blue/ });
  await expect(visit).toHaveAttribute("href", "/rooms/statistical#evt_1997_deep_blue");

  // Arrow keys step artefact to artefact, not year to year.
  await dial.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(dial).toHaveValue("1958");
  await expect(page.getByRole("link", { name: /^Visit / })).toHaveAttribute("href", "/rooms/symbolic#evt_1958_perceptron");
  await page.keyboard.press("End");
  await expect(dial).toHaveValue("2020");

  await page.getByRole("link", { name: /^Visit / }).click();
  await expect(page).toHaveURL(/\/rooms\/generative#evt_2020_alphafold$/);
  expect(errors).toEqual([]);
});

test("under reduced motion the dial still turns the shelf without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  // The canvas mounts only after hydration, so the dial is live by then.
  await expect(page.locator(".dial-stage canvas")).toHaveCount(1);
  const dial = page.getByRole("slider", { name: "Choose an era by year" });
  await dial.fill("2012");
  await expect(dial).toHaveAttribute("aria-valuetext", /^2012, /);
  await page.waitForTimeout(300);
  expect(errors).toEqual([]);
});

test("without WebGL the shelf is hidden and the dial still navigates", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto("/");
  await expect(page.locator(".dial-stage")).toBeHidden();
  await expect(page.locator("canvas")).toHaveCount(0);
  const dial = page.getByRole("slider", { name: "Choose an era by year" });
  await dial.fill("1938");
  await page.getByRole("link", { name: /^Visit / }).click();
  await expect(page).toHaveURL(/\/rooms\/precursors#ctx_1938_shannon_switching$/);
});
