import { test, expect } from "@playwright/test";

test.use({ storageState: "storageState.json" });

test("explore packs page", async ({ page }) => {
  await page.goto("http://localhost:3000/explore/packs");
  await page.waitForResponse(
    (response) =>
      response.url().includes("/saved-items/check-saved/") &&
      response.status() === 200,
  );
  await page.waitForSelector('button:has-text("Saved")');
  await page.waitForSelector("text=Created By You");

  await expect(page.getByRole("heading", { name: "Find Packs" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Title" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Author" })).toBeVisible();
  await page.getByRole("textbox", { name: "Title" }).click();
  await page.getByRole("textbox", { name: "Title" }).fill("testpack");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByRole("main")).toMatchAriaSnapshot(`
    - heading "testpack" [level=2]
    - button "@testuploader"
    - text: testpack +
    - button "Save Pack"
    - button "Download Pack"
    `);
  //   await page.getByText('+').click();
  //   await expect(page.locator('.bg-zinc-800.rounded-lg.p-3').first()).toBeVisible();
  //   await expect(page.locator('.space-y-3 > div:nth-child(2)')).toBeVisible();
  //   await expect(page.getByText('sub+')).toBeVisible();
  //   await expect(page.getByRole('button', { name: 'Save Pack' })).toBeVisible();
  //   await expect(page.getByRole('button', { name: 'Download Pack' })).toBeVisible();
  //   await page.getByText('+').click();
  //   await expect(page.locator('div:nth-child(3) > .border > .transition-all > .space-y-3 > div').first()).toBeVisible();
  //await page.getByRole('link', { name: 'Saved' }).click();
});
