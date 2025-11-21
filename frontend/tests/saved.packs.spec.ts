import { test, expect } from "@playwright/test";

test.use({ storageState: "storageState.json" });

test("saved packs page", async ({ page }) => {
  await page.goto("http://localhost:3000/saved/packs");
  await page.waitForSelector('button:has-text("Saved")');
  await page.waitForSelector("text=Created By You");
  await expect(page.getByRole("link", { name: "Saved" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Packs" })).toBeVisible();
  await expect(page.locator("body")).toMatchAriaSnapshot(`
    - heading "SampleMusic2000" [level=2]
    - button "@testname"
    - text: SampleMusic2000 +
    - button "Saved"
    - text: Created By You
    - button "Delete"
    - button "Download Pack"
    `);
});
