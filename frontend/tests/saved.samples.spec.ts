import { test, expect } from "@playwright/test";

test.use({ storageState: "storageState.json" });

test("saved samples page", async ({ page }) => {
  await page.goto("http://localhost:3000/saved/samples");
  await page.waitForResponse(
    (response) =>
      response.url().includes("/saved-items/check-saved/") &&
      response.status() === 200,
  );
  await page.waitForSelector('button:has-text("Saved")');
  //await page.waitForSelector('text=Created By You');

  await expect(
    page.getByRole("heading", { name: "Saved Samples" }),
  ).toBeVisible();
  await expect(page.getByRole("main")).toMatchAriaSnapshot(`
      - table:
        - rowgroup:
          - row "Play Name Waveform Volume Pitch Key BPM Genres Instruments Author Actions":
            - cell "Play"
            - cell "Name"
            - cell "Waveform"
            - cell "Volume"
            - cell "Pitch"
            - cell "Key"
            - cell "BPM"
            - cell "Genres"
            - cell "Instruments"
            - cell "Author"
            - cell "Actions"
        - rowgroup:
          - row /Play 0\\.5 1 Cymatics - Odyssey Breakdown Loop \\d+ - \\d+ BPM G Min Gm \\d+ house, pop, edm synth, pluck testuploader Saved Download/:
            - cell "Play":
              - button "Play": play_arrow
            - cell
            - cell "0.5":
              - slider: "0.5"
            - cell "1":
              - slider: "1"
            - cell /Cymatics - Odyssey Breakdown Loop \\d+ - \\d+ BPM G Min/
            - cell "Gm"
            - cell /\\d+/
            - cell "house, pop, edm"
            - cell "synth, pluck"
            - cell "testuploader"
            - cell "Saved Download":
              - button "Saved"
              - button "Download"
      `);
  //await page.getByRole('link', { name: 'Presets' }).click();
});
