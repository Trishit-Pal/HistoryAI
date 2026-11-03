import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 1920, height: 1080 } });

async function hasWebGL(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  });
}

async function blockingViolations(page: Page) {
  const result = await new AxeBuilder({ page }).analyze();
  return result.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
}

test("the exhibit tabs walk a hall with the arrow keys without leaving it", async ({ page }) => {
  await page.goto("/rooms/symbolic");
  test.skip(!(await hasWebGL(page)), "the exhibit tabs only appear with the 3D view");

  const tabs = page.getByRole("tablist", { name: "Exhibits in this hall" }).getByRole("tab");
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  const firstTitle = await page.getByRole("heading", { level: 1 }).innerText();

  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(firstTitle);
  await expect(page.getByRole("tabpanel")).toBeVisible();

  // The window listener that travels between halls must not also fire.
  await expect(page.getByRole("button", { name: /Symbolic golden age/ })).toHaveAttribute("aria-current", "true");

  await page.keyboard.press("Home");
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
});

test("plan view frames the sheet and stays accessible", async ({ page }) => {
  await page.goto("/rooms/symbolic");
  test.skip(!(await hasWebGL(page)), "plan view needs the 3D view");

  const toggle = page.getByRole("button", { name: "Plan view" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.getByRole("img", { name: /Plan of the halls/ })).toBeVisible();
  expect(await blockingViolations(page)).toEqual([]);

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
});

test("moving the year rail back seals the later halls", async ({ page }) => {
  await page.goto("/rooms/symbolic");
  // Filling before React hydrates is overwritten by the server value, so retry until it sticks.
  await expect(async () => {
    await page.locator("#year").fill("1960");
    await expect(page.getByText("Show work up to 1960")).toBeVisible({ timeout: 500 });
  }).toPass();
  await expect(page.getByRole("button", { name: /Statistical renaissance/ })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Symbolic golden age/ })).toBeEnabled();
  expect(await blockingViolations(page)).toEqual([]);
});

test("the no-WebGL fallback is a readable list, with future exhibits dimmed, and passes axe", async ({ page }) => {
  const webglErrors: string[] = [];
  page.on("pageerror", (error) => webglErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") webglErrors.push(message.text());
  });
  await page.addInitScript(() => {
    const w = window as unknown as { __canvasInserts: number };
    w.__canvasInserts = 0;
    HTMLCanvasElement.prototype.getContext = () => null;
    // React inserts the scene's <canvas> the moment it mounts, whatever the GL timing.
    // hasWebGL() probes with a detached canvas, which this never sees.
    new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof Element && (node.tagName === "CANVAS" || node.querySelector("canvas"))) w.__canvasInserts += 1;
        }
      }
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto("/rooms/symbolic");
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator(".flatland")).toBeVisible();
  await page.waitForTimeout(300);
  // The 3D canvas must never be attempted when the browser has no WebGL.
  expect(await page.evaluate(() => (window as unknown as { __canvasInserts: number }).__canvasInserts)).toBe(0);
  expect(webglErrors.filter((text) => /WebGL/i.test(text))).toEqual([]);
  await expect(page.getByRole("tablist")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Plan view" })).toHaveCount(0);

  await expect(async () => {
    await page.locator("#year").fill("1960");
    await expect(page.getByText("Show work up to 1960")).toBeVisible({ timeout: 500 });
  }).toPass();
  await expect(page.locator(".flatland article.ghost").first()).toBeVisible();
  expect(await blockingViolations(page)).toEqual([]);
});

test("a short laptop screen still shows the exhibit tabs", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.goto("/rooms/symbolic");
  test.skip(!(await hasWebGL(page)), "the exhibit tabs only appear with the 3D view");
  await expect(page.getByRole("tablist", { name: "Exhibits in this hall" })).toBeInViewport();
});

test("the no-WebGL list scrolls on a desktop screen", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto("/rooms/symbolic");
  const list = page.locator(".flatland");
  await expect(list).toBeVisible();
  const scrollable = await list.evaluate((el) => el.scrollHeight > el.clientHeight && getComputedStyle(el).overflowY === "auto");
  expect(scrollable).toBe(true);
  const last = page.getByRole("heading", { name: /Provisional hall/ });
  await last.scrollIntoViewIfNeeded();
  await expect(last).toBeInViewport();
});

test("on a narrow screen the tabs come before the panel they control, then the plan", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/rooms/symbolic");
  test.skip(!(await hasWebGL(page)), "the exhibit tabs only appear with the 3D view");

  const tablist = page.getByRole("tablist", { name: "Exhibits in this hall" });
  const panel = page.getByRole("tabpanel");
  const canvas = page.locator("canvas");
  const [tabsBox, panelBox, canvasBox] = await Promise.all([
    tablist.boundingBox(),
    panel.boundingBox(),
    canvas.boundingBox(),
  ]);
  expect(tabsBox!.y).toBeLessThan(panelBox!.y);
  expect(panelBox!.y).toBeLessThan(canvasBox!.y);

  const controlled = await tablist.getByRole("tab").first().getAttribute("aria-controls");
  await expect(panel).toHaveAttribute("id", controlled!);
});
