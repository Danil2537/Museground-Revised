import { test, expect } from "@playwright/test";

test.use({ storageState: "storageState.json" });

test("created samples page", async ({ page }) => {
  await page.goto("http://localhost:3000/created/samples");
  //await page.waitForSelector('button:has-text("Saved")');
  await page.waitForSelector("text=Created By You");

  await page.getByRole("link", { name: "Created" }).click();
  await expect(
    page.getByRole("heading", { name: "Samples You Created" }),
  ).toBeVisible();
  await expect(page.getByRole("row")).toMatchAriaSnapshot(`
    - textbox:
      - /placeholder: " "
      - text: sliding sun
    - text: Name
    - textbox:
      - /placeholder: " "
      - text: B
    - text: Key
    - spinbutton: /\\d+/
    - text: BPM
    - textbox:
      - /placeholder: " "
      - text: dnb
    - text: Genres
    - textbox:
      - /placeholder: " "
      - text: guitar, bass, drums, synth
    - text: Instruments
    - button "play_arrow"
    - text: Volume
    - slider: "0.5"
    - text: Pitch
    - slider: "1"
    - button "Save"
    - button "Download"
    - text: Created By You
    - button "Replace File"
    - button "Delete"
    - button "Update"
    `);
  await page.getByRole("slider").first().fill("0.58");
  await page.getByRole("slider").nth(1).fill("1.1");
  await expect(page.getByRole("button", { name: "play_arrow" })).toBeVisible();
  await page.getByRole("button", { name: "play_arrow" }).click();
  await expect(page.getByRole("button", { name: "pause" })).toBeVisible();
  await page.getByRole("button", { name: "pause" }).click();
  await expect(page.getByRole("button", { name: "play_arrow" })).toBeVisible();
  await page.locator('input[name="name"]').click();
  await page.locator('input[name="key"]').click();
  await page.getByRole("spinbutton").click();
  await page.locator('input[name="genres"]').click();
  await page.locator('input[name="instruments"]').click();
  await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(
    page.getByRole("row", { name: "sliding sun Name B Key 160" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Saved" }).click();
  await expect(
    page.getByRole("row", { name: "sliding sun Name B Key 160" }),
  ).toBeVisible();
});
