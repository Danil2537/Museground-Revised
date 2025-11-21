import { test, expect } from "@playwright/test";

test.use({ storageState: "storageState.json" });

test("saved presets page", async ({ page }) => {
  await page.goto("http://localhost:3000/saved/presets");

  //   await page.waitForResponse(response =>
  //     response.url().includes('/saved-items/check-saved/') && response.status() === 200
  //   );
  await page.waitForSelector('button:has-text("Saved")');
  await page.waitForSelector("text=Created By You");
  await expect(
    page.getByRole("heading", { name: "Saved Presets" }),
  ).toBeVisible();
  await expect(page.locator("div").nth(2)).toBeVisible();
  await expect(page.getByRole("main")).toMatchAriaSnapshot(`
    - button "play_arrow"
    - heading "Chill synth" [level=2]
    - button "Serum"
    - button "house, edm"
    - button "pad"
    - button "@testname"
    - button "Saved"
    - button "Download"
    - text: Created by You
    - button "Delete"
    `);
  //await page.getByRole('link', { name: 'Packs' }).click();
});
