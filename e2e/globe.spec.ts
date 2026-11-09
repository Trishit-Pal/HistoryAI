import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// SwiftShader gives headless Chromium WebGL, so the globe canvas mounts. Launch options are per worker,
// so the no-WebGL case takes the context away in the page instead, as e2e/dial.spec.ts does.
test.use({
  viewport: { width: 1440, height: 900 },
  launchOptions: { args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] },
});

async function blockingViolations(page: Page) {
  const result = await new AxeBuilder({ page }).analyze();
  return result.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
}

test.describe("with WebGL", () => {
  test("the globe replays the spread year by year and credits its sources", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/globe");
    await expect(page.getByRole("heading", { level: 1, name: "Who builds the frontier" })).toBeVisible();
    await expect(page.locator(".globe-canvas canvas")).toHaveCount(1);
    await expect(page.locator("canvas")).toHaveCount(1);

    const year = page.getByRole("slider", { name: "Choose a year" });
    const count = page.locator(".globe-count");
    await year.fill("2018");
    await expect(count).toHaveText("No model at this scale yet. The first arrives in 2019.");

    await year.fill("2025");
    await expect(count).toContainText("labs in");
    const countries = Number((await count.innerText()).match(/labs in (\d+) countries/)?.[1]);
    expect(countries).toBeGreaterThanOrEqual(21);

    await year.fill("2023");
    await expect(page.locator(".globe-records")).toContainText("GPT-4");
    await expect(page.locator(".globe-records")).toContainText("over the previous record");
    await expect(page.locator(".globe-records")).toContainText("Epoch AI estimate");
    await expect(page.locator(".globe-records a", { hasText: "Source" }).first()).toHaveAttribute("href", /^https:\/\//);

    const credits = page.locator(".globe-credit");
    await expect(credits).toContainText("Epoch AI estimate");
    await expect(credits).toContainText("NASA");
    expect(await blockingViolations(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("on a phone the country panel is a bottom sheet", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/globe");
    const opener = page.locator(".globe-table").getByRole("button", { name: "United Kingdom" });
    await opener.click();
    const panel = page.getByRole("region", { name: "United Kingdom" });
    await expect(panel).toBeVisible();
    const box = (await panel.boundingBox())!;
    expect(Math.round(box.y + box.height)).toBe(844);
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(opener).toBeFocused();
  });
});

test("the globe draws nothing while idle, and settles again after the year moves", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __draws: number };
    w.__draws = 0;
    for (const proto of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
      for (const name of ["drawElements", "drawArrays", "drawElementsInstanced", "drawArraysInstanced"] as const) {
        const original = (proto as unknown as Record<string, (...args: unknown[]) => void>)[name];
        (proto as unknown as Record<string, unknown>)[name] = function (this: unknown, ...args: unknown[]) {
          w.__draws += 1;
          return original.apply(this, args);
        };
      }
    }
  });
  const draws = () => page.evaluate(() => (window as unknown as { __draws: number }).__draws);
  const settled = async () => {
    let before = await draws();
    for (let i = 0; i < 8; i += 1) {
      await page.waitForTimeout(1500);
      const now = await draws();
      if (now === before) return now;
      before = now;
    }
    throw new Error("the globe never stopped drawing");
  };
  await page.goto("/globe");
  await expect(page.locator(".globe-canvas canvas")).toHaveCount(1);
  const idle = await settled();
  await page.getByRole("slider", { name: "Choose a year" }).fill("2021");
  await expect.poll(draws).toBeGreaterThan(idle);
  const after = await settled();
  await page.waitForTimeout(1500);
  expect(await draws()).toBe(after);
});

test.describe("without WebGL", () => {
  test("the country table is the route, and a country opens its panel", async ({ page }) => {
    await page.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = () => null;
    });
    await page.goto("/globe");
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator(".globe-canvas")).toBeHidden();
    const usa = page.locator(".globe-table").getByRole("button", { name: "United States of America" });
    await usa.click();
    const panel = page.getByRole("region", { name: "United States of America" });
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("Epoch AI estimate");
    await expect(panel.locator('a[href^="/atlas#model="]').first()).toBeVisible();
    // The slider starts at 2026, where the data stops on 1 November.
    await expect(panel.locator(".globe-panel-count")).toContainText("with a lab in United States of America by 1 Nov 2026");
    await expect(page.locator(".globe-table thead")).toContainText("Models by 1 Nov 2026");
    expect(await blockingViolations(page)).toEqual([]);
    await panel.getByRole("button", { name: "Close" }).click();
    await expect(panel).toHaveCount(0);
    await expect(usa).toBeFocused();
  });
});

test("the ranking orders countries for the chosen year and picks one", async ({ page }) => {
  await page.goto("/globe");
  await expect(page.locator(".globe-canvas canvas")).toHaveCount(1);
  const ranking = page.getByRole("region", { name: /^Models per country/ });
  const year = page.getByRole("slider", { name: "Choose a year" });

  await year.fill("2018");
  await expect(ranking).toHaveCount(0);

  await year.fill("2025");
  await expect(ranking).toContainText("by the end of 2025");
  await expect(ranking).toContainText("counts for both");
  const counts = (await ranking.locator(".globe-ranking-count").allInnerTexts()).map((text) => Number.parseInt(text, 10));
  expect(counts.length).toBeGreaterThanOrEqual(21);
  expect(counts).toEqual([...counts].sort((a, b) => b - a));

  // The ranking and the table count the same way.
  const leader = ranking.getByRole("button").first();
  const leaderName = (await leader.locator(".globe-ranking-name").innerText()).trim();
  const tableRow = page.locator(".globe-table tbody tr").first();
  await expect(tableRow.locator("th")).toHaveText(leaderName);
  await expect(tableRow.locator(".globe-table-number")).toHaveText(String(counts[0]));

  await leader.click();
  await expect(leader).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("region", { name: leaderName, exact: true })).toBeVisible();
});
