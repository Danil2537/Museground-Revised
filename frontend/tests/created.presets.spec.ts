import { test, expect } from "@playwright/test";

test.use({ storageState: "storageState.json" });

test("created presets page", async ({ page }) => {
  await page.goto("http://localhost:3000/created/presets");
  // await page.waitForResponse(response =>
  //     response.url().includes('/saved-items/check-saved/') && response.status() === 200
  //   );
  // await page.waitForSelector('button:has-text("Saved")');
  // await page.waitForSelector('text=Created By You');
  await page.waitForSelector('button:has-text("Saved")');
  await page.waitForSelector("text=Created By You");

  await page.getByRole("link", { name: "Presets" }).click();
  await expect(
    page.getByRole("heading", { name: "Presets You Created" }),
  ).toBeVisible();
  await expect(page.getByRole("main")).toMatchAriaSnapshot(`
        - textbox:
          - /placeholder: " "
          - text: Chill synth
        - text: Name
        - textbox:
          - /placeholder: " "
          - text: Serum
        - text: Vst
        - textbox:
          - /placeholder: " "
          - text: house, edm
        - text: Genres
        - textbox:
          - /placeholder: " "
          - text: pad
        - text: Types
        - button "play_arrow"
        - text: Volume
        - slider: "0.5"
        - button "Saved"
        - text: Created By You
        - button "Replace Preset File"
        - button "Replace Sound File"
        - button "Update"
        - button "Delete"
        `);
  await page.locator('input[name="name"]').click();
  await page.locator('input[name="vst"]').click();
  await page.locator('input[name="vst"]').click();
  await page.locator('input[name="genres"]').click();
  await page.locator('input[name="types"]').click();
  await page.waitForSelector('button:has-text("Saved")');
  await page.waitForSelector("text=Created By You");

  await expect(page.getByRole("button", { name: "Saved" })).toBeVisible();
  //   await page.waitForSelector('button:has-text("Saved")');

  //   await page.getByRole('button', { name: 'Saved' }).click();
  //   await page.waitForSelector('button:has-text("Save")');

  //   await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  //   await page.getByRole('button', { name: 'Save' }).click();
  //   await page.waitForSelector('button:has-text("Saved")');

  await expect(page.getByRole("button", { name: "Saved" })).toBeVisible();
  await page.getByRole("button", { name: "Update" }).click();
});
