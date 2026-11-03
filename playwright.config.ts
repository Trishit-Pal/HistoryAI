import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  projects: [
    { name: "chromium", testIgnore: /db\.spec\.ts/, use: { ...devices["Desktop Chrome"] } },
    { name: "db", testMatch: /db\.spec\.ts/, use: { ...devices["Desktop Chrome"] } },
  ],
  use: {
    baseURL: "http://localhost:3000",
    ...devices["Desktop Chrome"],
    viewport: { width: 1920, height: 1080 },
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
