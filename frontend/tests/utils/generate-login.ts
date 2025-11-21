import { chromium } from "@playwright/test";

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("http://localhost:3000/login");

  // Fill login form
  await page.fill('input[name="username"]', "testname");
  await page.fill('input[name="password"]', "testpass");
  await page.click('button[type="submit"]');

  // Wait for some page element that indicates login success
  await page.waitForURL("http://localhost:3000/explore/samples");

  // Save authenticated storage state
  await context.storageState({ path: "storageState.json" });

  await browser.close();
})();
