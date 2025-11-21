import { chromium } from "@playwright/test";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Perform real login or mock login
  await page.request.post("http://localhost:3001/auth/login-jwt", {
    data: {
      username: "testname",
      email: "testmail@gmail.com",
      password: "testpass",
    },
  });

  // Save storage state
  await page.context().storageState({ path: "storageState.json" });

  await browser.close();
})();
