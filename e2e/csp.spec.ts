import { expect, test } from "@playwright/test";

test("the corridor and an exhibit page stay inside the content security policy", async ({ page }) => {
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
  const home = await page.goto("/");
  expect(home?.headers()["content-security-policy"] ?? "").toContain("default-src 'self'");
  await page.waitForTimeout(500);
  await page.goto("/rooms/precursors/ctx_1843_analytical_engine");
  await page.waitForTimeout(300);
  const fired = await page.evaluate(() => (window as Window & { __csp?: string[] }).__csp ?? []);
  expect([...fired, ...violations]).toEqual([]);
});
