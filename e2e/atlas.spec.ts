import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 } });

const FEATURED_COUNT = 80;
const GOVERNANCE_COUNT = 6;

test("the atlas lists its 80 featured models and its governance entries as text, with sources and reasons", async ({ page }) => {
  await page.goto("/atlas");
  await expect(page.getByRole("heading", { level: 1, name: "The scale of AI" })).toBeVisible();

  const tables = page.getByRole("table");
  await expect(tables).toHaveCount(2);
  await expect(tables.nth(0).locator("tbody tr")).toHaveCount(FEATURED_COUNT);
  await expect(tables.nth(1).locator("tbody tr")).toHaveCount(GOVERNANCE_COUNT);

  const alexnet = tables.nth(0).getByRole("row", { name: /AlexNet/ });
  await expect(alexnet.getByRole("link", { name: /Epoch/ })).toHaveAttribute("href", /^https:\/\//);
  await expect(alexnet.getByRole("link", { name: /Exhibit: AlexNet/ })).toHaveAttribute(
    "href",
    "/rooms/deep-learning/evt_2012_alexnet",
  );

  await expect(tables.nth(0).getByRole("row", { name: /Zip CNN/ })).toContainText("Largest training run of its day");

  await expect(page.getByText(/Licensed\s+CC BY 4\.0/)).toBeVisible();
});

test("the atlas has no serious or critical accessibility violations", async ({ page }) => {
  await page.goto("/atlas");
  await expect(page.getByRole("table").first()).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );
  expect(blocking).toEqual([]);
});

test("an exhibit page opens the atlas on its model, and the atlas links back", async ({ page }) => {
  await page.goto("/rooms/deep-learning/evt_2012_alexnet");
  await page.getByRole("link", { name: "See it in the Atlas" }).click();
  await expect(page).toHaveURL(/\/atlas#model=AlexNet$/);

  const detail = page.locator(".atlas-detail");
  await expect(detail.getByRole("heading", { name: "AlexNet" })).toBeVisible();
  await expect(detail).toContainText("Epoch AI estimate");
  await expect(detail.getByRole("link", { name: "Epoch’s source for this model" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Back to the whole plot" })).toBeVisible();

  await detail.getByRole("link", { name: /Read the exhibit/ }).click();
  await expect(page).toHaveURL(/\/rooms\/deep-learning\/evt_2012_alexnet$/);
});

test("switching the measure changes what is drawn and says how many models it covers", async ({ page }) => {
  await page.goto("/atlas");
  const coverage = page.locator(".atlas-coverage");
  await expect(coverage).toContainText("training compute estimate");
  await expect(coverage).toContainText("most significant");

  await page.getByRole("button", { name: "Parameters", exact: true }).click();
  await expect(page.getByRole("button", { name: "Parameters", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(coverage).toContainText("parameter count");
});

test("the plot shows the 80 most significant models by default, and one switch brings back the rest", async ({ page }) => {
  await page.goto("/atlas");
  const coverage = page.locator(".atlas-coverage");
  const showAll = page.getByRole("button", { name: "Show all models" });

  await expect(showAll).toHaveAttribute("aria-pressed", "false");
  await expect(coverage).toContainText("most significant of the 1,407");

  await showAll.click();
  await expect(showAll).toHaveAttribute("aria-pressed", "true");
  await expect(coverage).toContainText("all 1,407");

  // The table is the featured models either way.
  await expect(page.getByRole("table").first().locator("tbody tr")).toHaveCount(FEATURED_COUNT);

  await showAll.click();
  await expect(coverage).toContainText("most significant of the 1,407");
});

test("any featured model has an address, not only the landmarks, and says why it is there", async ({ page }) => {
  await page.goto("/atlas#model=Zip%20CNN");
  const detail = page.locator(".atlas-detail");
  await expect(detail.getByRole("heading", { name: "Zip CNN" })).toBeVisible();
  await expect(detail).toContainText("Why it is here");
  await expect(detail).toContainText("Largest training run of its day");
});

test("next model focuses a model, and the view buttons and reset work without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/atlas");
  const webgl = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  });
  test.skip(!webgl, "No WebGL in this browser.");

  const detail = page.locator(".atlas-detail");
  await page.getByRole("button", { name: "Next model" }).click();
  await expect(detail.locator("h2")).toBeVisible();
  await expect(page).toHaveURL(/#model=/);

  await page.getByRole("button", { name: "Front", exact: true }).click();
  await expect(page).not.toHaveURL(/#model=/);
  await page.getByRole("button", { name: "Next model" }).click();
  await expect(detail.locator("h2")).toBeVisible();
  await page.getByRole("button", { name: "Back to the whole plot" }).click();
  await expect(page).not.toHaveURL(/#model=/);
  expect(errors).toEqual([]);
});

test("the plot says how to move around and how to read it, and its view buttons keep the arrow keys", async ({ page }) => {
  await page.goto("/atlas");
  const webgl = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  });
  test.skip(!webgl, "No WebGL in this browser.");

  await expect(page.locator("#atlas-keys-hint")).toBeVisible();
  await expect(page.locator("#atlas-keys-hint")).toContainText("Drag to turn the plot");
  await expect(page.getByRole("region", { name: "Axes" })).toContainText("Training compute, FLOP, log scale");
  await expect(page.getByRole("region", { name: "Domains" })).toContainText("Language");
  await expect(page.getByRole("region", { name: "Marks" })).toContainText("AI winter");

  await page.getByRole("button", { name: "Parameters", exact: true }).click();
  await expect(page.getByRole("region", { name: "Axes" })).toContainText("Parameters, log scale");

  // Arrow keys on a view button belong to the button, not to the plot behind it.
  const front = page.getByRole("button", { name: "Front", exact: true });
  await front.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page).not.toHaveURL(/#model=/);

  await page.locator(".atlas-canvas").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/#model=/);
});

test("without WebGL the same landmarks are still there as a table", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto("/atlas");
  await expect(page.getByText(/cannot draw the 3D view/)).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  // Nothing to move or read without the plot.
  await expect(page.getByRole("button", { name: "Front", exact: true })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Axes" })).toHaveCount(0);
  await expect(page.getByRole("table").first().locator("tbody tr")).toHaveCount(FEATURED_COUNT);
});

test("the atlas stays inside the content security policy", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("Content Security Policy")) violations.push(message.text());
  });
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      (window as Window & { __csp?: string[] }).__csp ??= [];
      (window as Window & { __csp?: string[] }).__csp?.push(event.violatedDirective);
    });
  });
  await page.goto("/atlas");
  await page.waitForTimeout(1500);
  const fired = await page.evaluate(() => (window as Window & { __csp?: string[] }).__csp ?? []);
  expect([...fired, ...violations]).toEqual([]);
});

test("the atlas draws one canvas and samples its frame time", async ({ page }) => {
  await page.goto("/atlas");
  const webgl = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  });
  test.skip(!webgl, "No WebGL in this browser.");

  await expect(page.locator("canvas")).toHaveCount(1);
  const average = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let last = 0;
        const deltas: number[] = [];
        const finish = () => resolve(deltas.length ? deltas.reduce((sum, delta) => sum + delta, 0) / deltas.length : 0);
        const sample = (now: number) => {
          if (last > 0) deltas.push(now - last);
          last = now;
          if (deltas.length < 60) requestAnimationFrame(sample);
          else finish();
        };
        requestAnimationFrame(sample);
        setTimeout(finish, 4000);
      }),
  );
  console.log(`Atlas frame sample ${average.toFixed(2)} ms`);
});
