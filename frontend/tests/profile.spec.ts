import test, { expect } from "@playwright/test";
test.use({ storageState: "storageState.json" });
test("Profile page", async ({ page }) => {
  await page.goto("/profile");

  await expect(page.getByText("Username: testname")).toBeVisible();
  await expect(page.getByText("Email: testmail@gmail.com")).toBeVisible();

  await expect(page.getByText("No folder chosen yet.")).toBeVisible();
});
