import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// SwiftShader gives headless Chromium WebGL; without it the Inspect button is (correctly) absent.
test.use({
  viewport: { width: 1440, height: 900 },
  launchOptions: { args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] },
});

test("inspect the perceptron: dialog opens, a part shows its source, Esc returns focus", async ({ page }) => {
  await page.goto("/rooms/symbolic#evt_1958_perceptron");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Perceptron");

  const webgl = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  });
  const inspect = page.getByRole("button", { name: "Inspect the artefact" });
  if (!webgl) {
    await expect(inspect).toHaveCount(0);
    return;
  }

  await inspect.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleName(/Perceptron/);
  await expect(dialog.locator("canvas")).toHaveCount(1);

  const part = dialog.getByRole("button", { name: "Photocells" });
  await part.click();
  await expect(part).toHaveAttribute("aria-pressed", "true");
  await expect(dialog.getByText("An array of 400 photocells arranged in a 20x20 grid.", { exact: false })).toBeVisible();
  await expect(dialog.locator(".inspect-text a")).toHaveAttribute("href", "https://en.wikipedia.org/wiki/Perceptron");

  // Arrow keys belong to the dialog: the halls behind it must not move.
  await page.keyboard.press("ArrowRight");
  await part.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/\/rooms\/symbolic/);
  // The page behind a modal is inert (out of the accessibility tree), so read the Dossier by class.
  await expect(page.locator(".dossier h1")).toContainText("Perceptron");
  await expect(dialog).toBeVisible();

  const axe = await new AxeBuilder({ page }).include(".inspect").analyze();
  expect(axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(inspect).toBeFocused();
});
