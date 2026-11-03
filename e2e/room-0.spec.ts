import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1920, height: 1080 } });

async function tabTo(page: import("@playwright/test").Page, name: RegExp, shift = false) {
  const button = page.getByRole("button", { name });
  for (let step = 0; step < 40; step += 1) {
    if (await button.evaluate((element) => element === document.activeElement)) return button;
    await page.keyboard.press(shift ? "Shift+Tab" : "Tab");
  }
  return button;
}

test("keyboard leaves Formal founding for Precursors and the plate stays readable", async ({ page }) => {
  await page.goto("/rooms/founding");
  const founding = await tabTo(page, /Formal founding/);
  await expect(founding).toBeFocused();
  await founding.press("Enter");
  await expect(founding).toHaveAttribute("aria-current", "true");

  const precursors = await tabTo(page, /Precursors/, true);
  await expect(precursors).toBeFocused();
  await precursors.press("Enter");
  await expect(precursors).toHaveAttribute("aria-current", "true");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Mechanical and logical precursors");

  const source = page.getByRole("link", { name: /Source:/ }).first();
  for (let step = 0; step < 40; step += 1) {
    if (await source.evaluate((element) => element === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(source).toBeFocused();

  const accessibility = await new AxeBuilder({ page }).analyze();
  const blocking = accessibility.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );
  expect(blocking).toEqual([]);

  const webgl = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  });
  if (webgl) {
    await expect(page.locator("canvas")).toHaveCount(1);
    await page.screenshot({ path: "e2e/artifacts/room-0.png", fullPage: false });
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
          setTimeout(finish, 2500);
        }),
    );
    console.log(`Room 0 frame sample ${average.toFixed(2)} ms`);
  }
});

test("reduced motion still reaches the Precursors plate", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/rooms/founding");
  const precursors = await tabTo(page, /Precursors/);
  await precursors.press("Enter");
  await expect(precursors).toHaveAttribute("aria-current", "true");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
