import { test, expect } from "@playwright/test";

test.use({ storageState: "storageState.json" });

test("explore presets page", async ({ page }) => {
  await page.goto("http://localhost:3000/explore/presets");
  //   await page.waitForResponse(response =>
  //     response.url().includes('/saved-items/check-saved/') && response.status() === 200
  //   );
  await page.waitForSelector('button:has-text("Saved")');
  await page.waitForSelector("text=Created By You");

  await expect(
    page.getByRole("heading", { name: "Find Presets" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Title" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Author" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "VST Plugin" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Genres" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Types" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  await expect(
    page.locator("div").filter({ hasText: "play_arrowSatisfaction" }).nth(2),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "play_arrow" }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "play_arrow" }).first().click();
  await expect(page.getByRole("button", { name: "pause" })).toBeVisible();
  await page.getByRole("button", { name: "pause" }).click();
  await expect(
    page.getByRole("button", { name: "play_arrow" }).first(),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Save Preset" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Saved" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download" })).toBeVisible();
  await expect(page.getByText("Created by You")).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
  await page.getByRole("textbox", { name: "Genres" }).click();
  await page.getByRole("textbox", { name: "Genres" }).fill("house");
  await expect(page.locator("form")).toContainText("Genres");
  await expect(page.getByRole("textbox", { name: "Genres" })).toBeVisible();
  await page.getByRole("button", { name: "Search" }).click();
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
