import { expect, test, type Page } from "@playwright/test";

// SwiftShader gives headless Chromium WebGL, so the shelf canvas mounts.
test.use({
  viewport: { width: 1440, height: 900 },
  launchOptions: { args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] },
});

// The dial is one step per artefact, oldest first: 1843, 1938, 1958, 1997, 2012, 2016, 2020, 2022, 2026.
const DEEP_BLUE = "3";

// Counts every WebGL draw call, so a test can tell whether the canvas is still rendering.
async function countDraws(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __draws: number };
    w.__draws = 0;
    for (const proto of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
      for (const name of ["drawElements", "drawArrays", "drawElementsInstanced", "drawArraysInstanced"] as const) {
        const original = (proto as unknown as Record<string, (...args: unknown[]) => void>)[name];
        if (typeof original !== "function") continue;
        (proto as unknown as Record<string, unknown>)[name] = function (this: unknown, ...args: unknown[]) {
          w.__draws += 1;
          return original.apply(this, args);
        };
      }
    }
  });
}

const draws = (page: Page) => page.evaluate(() => (window as unknown as { __draws: number }).__draws);

// Waits until no draw happens for `quiet` ms (or fails after `limit`), then returns the count.
async function settled(page: Page, quiet = 1500, limit = 12_000): Promise<number> {
  const start = Date.now();
  let before = await draws(page);
  while (Date.now() - start < limit) {
    await page.waitForTimeout(quiet);
    const now = await draws(page);
    if (now === before) return now;
    before = now;
  }
  throw new Error("the dial canvas never stopped rendering");
}

test("the dial steps artefact by artefact, names it and links to its room", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const dial = page.getByRole("slider", { name: "Choose an era by year" });
  await expect(dial).toHaveAttribute("aria-valuetext", /^1843, /);
  await expect(page.locator(".dial-stage canvas")).toHaveCount(1);
  await expect(page.locator("canvas")).toHaveCount(1);

  await dial.fill(DEEP_BLUE);
  await expect(dial).toHaveAttribute("aria-valuetext", /^1997, .*Deep Blue/);
  await expect(page.locator(".dial-label")).toContainText("1997 ·");
  const visit = page.getByRole("link", { name: /^Visit .*Deep Blue/ });
  await expect(visit).toHaveAttribute("href", "/rooms/statistical#evt_1997_deep_blue");

  // The native keys walk one artefact at a time.
  await dial.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(dial).toHaveAttribute("aria-valuetext", /^1958, /);
  await expect(page.getByRole("link", { name: /^Visit / })).toHaveAttribute("href", "/rooms/symbolic#evt_1958_perceptron");
  await page.keyboard.press("End");
  await expect(dial).toHaveAttribute("aria-valuetext", /^2026, /);

  await page.getByRole("link", { name: /^Visit / }).click();
  await expect(page).toHaveURL(/\/rooms\/frontier#evt_2026_gpt6_astra$/);
  expect(errors).toEqual([]);
});

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`the dial canvas idles until the dial moves, then stops again (${reducedMotion})`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.emulateMedia({ reducedMotion });
    await countDraws(page);
    await page.goto("/");
    await expect(page.locator(".dial-stage canvas")).toHaveCount(1);

    const idle = await settled(page);
    await page.waitForTimeout(1500);
    expect(await draws(page)).toBe(idle);

    await page.getByRole("slider", { name: "Choose an era by year" }).fill(DEEP_BLUE);
    await expect.poll(() => draws(page)).toBeGreaterThan(idle);
    // Play lasts about 4 s; after it the canvas must go quiet again.
    const after = await settled(page);
    await page.waitForTimeout(1500);
    expect(await draws(page)).toBe(after);
    expect(errors).toEqual([]);
  });
}

test("the stage keeps its box while the canvas loads", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __dialShift: number };
    w.__dialShift = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as { value: number; sources?: { node?: Node }[] }[]) {
        const inDial = entry.sources?.some((source) => source.node instanceof Element && source.node.closest(".dial"));
        if (inDial) w.__dialShift += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto("/");
  const stage = page.locator(".dial-stage");
  const before = await stage.boundingBox();
  await expect(stage.locator("canvas")).toHaveCount(1);
  await page.waitForTimeout(500);
  expect(await stage.boundingBox()).toEqual(before);
  expect(await page.evaluate(() => (window as unknown as { __dialShift: number }).__dialShift)).toBe(0);
});

test("on a phone the stage is at most half the screen and the thumb is a 44px target", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const stage = await page.locator(".dial-stage").boundingBox();
  expect(stage!.height).toBeLessThanOrEqual(844 / 2);
  const dial = page.getByRole("slider", { name: "Choose an era by year" });
  expect((await dial.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  const thumb = await dial.evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue("--thumb")));
  expect(thumb).toBeGreaterThanOrEqual(44);
});

test("without WebGL the shelf is hidden and the dial still navigates", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto("/");
  await expect(page.locator(".dial-stage")).toBeHidden();
  await expect(page.locator("canvas")).toHaveCount(0);
  const dial = page.getByRole("slider", { name: "Choose an era by year" });
  await dial.fill("1");
  await expect(dial).toHaveAttribute("aria-valuetext", /^1938, /);
  await page.getByRole("link", { name: /^Visit / }).click();
  await expect(page).toHaveURL(/\/rooms\/precursors#ctx_1938_shannon_switching$/);
});
