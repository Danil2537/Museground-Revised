import { test, expect } from "@playwright/test";

test.use({
  storageState: "storageState.json",
});

test("explore samples page", async ({ page }) => {
  await page.goto("http://localhost:3000/explore/samples");
  await page.waitForResponse(
    (response) =>
      response.url().includes("/saved-items/check-saved/") &&
      response.status() === 200,
  );
  await page.waitForSelector('button:has-text("Saved")');
  await page.waitForSelector("text=Created By You");

  const header = await page.getByRole("heading", { name: "Find Samples" });
  const headerStyles = await header.evaluate((el) => ({
    color: window.getComputedStyle(el).color,
    fontFamily: window.getComputedStyle(el).fontFamily,
  }));
  console.log(headerStyles);
  expect(headerStyles.fontFamily).toContain("suprapower");

  const headers = await page.locator("thead th");
  const headerCount = await headers.count();
  for (let i = 0; i < headerCount; i++) {
    const font = await headers
      .nth(i)
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(font).toContain("programme");
  }

  const bodyCells = await page.locator("tbody td");
  const bodyCount = await bodyCells.count();
  for (let i = 0; i < bodyCount; i++) {
    const font = await bodyCells
      .nth(i)
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(font).toContain("programme");
  }

  await expect(page.getByRole("main")).toMatchAriaSnapshot(`
    - main:
      - heading "Find Samples" [level=1]
      - textbox "Title":
        - /placeholder: " "
      - text: Title
      - textbox "Author":
        - /placeholder: ""
      - text: Author
      - spinbutton "Min BPM"
      - text: Min BPM
      - spinbutton "Max BPM"
      - text: Max BPM
      - textbox "Instruments":
        - /placeholder: ""
      - text: Instruments
      - textbox "Genres":
        - /placeholder: ""
      - text: Genres
      - textbox "Key":
        - /placeholder: ""
      - text: Key
      - button "Search"
      - table:
        - rowgroup:
          - row "Play / Pause Waveform Volume Pitch Title Key BPM Genres Instruments Author Save":
            - cell "Play / Pause"
            - cell "Waveform"
            - cell "Volume"
            - cell "Pitch"
            - cell "Title"
            - cell "Key"
            - cell "BPM"
            - cell "Genres"
            - cell "Instruments"
            - cell "Author"
            - cell "Save"
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
          - row /Play 0\\.5 1 sliding sun B \\d+ dnb guitar, bass, drums, synth testname Save Created By You Delete/:
            - cell "Play":
              - button "Play": play_arrow
            - cell
            - cell "0.5":
              - slider: "0.5"
            - cell "1":
              - slider: "1"
            - cell "sliding sun"
            - cell "B"
            - cell /\\d+/
            - cell "dnb"
            - cell "guitar, bass, drums, synth"
            - cell "testname"
            - cell "Save Created By You Delete":
              - button "Save"
              - button "Delete"
          - row /Play 0\\.5 1 tepid triumph vfe \\d+ vrfedferf gregvreswgfvrse popbob Save/:
            - cell "Play":
              - button "Play": play_arrow
            - cell
            - cell "0.5":
              - slider: "0.5"
            - cell "1":
              - slider: "1"
            - cell "tepid triumph"
            - cell "vfe"
            - cell /\\d+/
            - cell "vrfedferf"
            - cell "gregvreswgfvrse"
            - cell "popbob"
            - cell "Save":
              - button "Save"
    `);
  await expect(
    page.getByText("LoginProfileExploreUploadSavedCreatedSamplesPresetsPacks"),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Profile" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Upload" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Saved" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Created" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Samples" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Presets" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Packs" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Find Samples" }),
  ).toBeVisible();
  await expect(page.getByRole("heading")).toContainText("Find Samples");
  await expect(page.getByText("TitleAuthorMin BPMMax")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Title" })).toBeVisible();
  await expect(page.locator("form").getByText("Title")).toBeVisible();
  await expect(page.locator("form")).toContainText("Title");
  await expect(page.getByRole("textbox", { name: "Author" })).toBeVisible();
  await expect(page.locator("form").getByText("Author")).toBeVisible();
  await expect(page.locator("form")).toContainText("Author");
  await expect(page.getByRole("spinbutton", { name: "Min BPM" })).toBeVisible();
  await expect(page.locator("form")).toContainText("Min BPM");
  await expect(page.getByRole("spinbutton", { name: "Max BPM" })).toBeVisible();
  await expect(page.getByText("Max BPM")).toBeVisible();
  await expect(page.locator("form")).toContainText("Max BPM");
  await expect(
    page.getByRole("textbox", { name: "Instruments" }),
  ).toBeVisible();
  await expect(page.locator("form").getByText("Instruments")).toBeVisible();
  await expect(page.locator("form")).toContainText("Instruments");
  await expect(page.getByRole("textbox", { name: "Genres" })).toBeVisible();
  await expect(page.locator("form").getByText("Genres")).toBeVisible();
  await expect(page.locator("form")).toContainText("Genres");
  await expect(page.getByRole("textbox", { name: "Key" })).toBeVisible();
  await expect(page.locator("form").getByText("Key")).toBeVisible();
  await expect(page.locator("form")).toContainText("Key");
  await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  await expect(page.locator("form")).toContainText("Search");
  await page.getByRole("textbox", { name: "Title" }).click();
  await page.getByRole("textbox", { name: "Title" }).fill("text");
  await expect(page.locator("form").getByText("Title")).toBeVisible();
  await page.getByRole("textbox", { name: "Author" }).click();
  await page.getByRole("textbox", { name: "Author" }).fill("text");
  await expect(page.locator("form").getByText("Author")).toBeVisible();
  await page.getByText("Min BPM").click();
  await page.getByRole("spinbutton", { name: "Min BPM" }).fill("120");
  await expect(page.getByText("Min BPM")).toBeVisible();
  await page.getByText("Max BPM").click();
  await page.getByRole("spinbutton", { name: "Max BPM" }).fill("125");
  await expect(page.getByText("Max BPM")).toBeVisible();
  await page.getByRole("textbox", { name: "Instruments" }).click();
  await page.getByRole("textbox", { name: "Instruments" }).fill("piano");
  await expect(page.locator("form").getByText("Instruments")).toBeVisible();
  await page.locator("form").getByText("Genres").click();
  await page.getByRole("textbox", { name: "Genres" }).fill("edm");
  await expect(page.locator("form").getByText("Genres")).toBeVisible();
  await page.getByRole("textbox", { name: "Key" }).click();
  await page.getByRole("textbox", { name: "Key" }).fill("C");
  await expect(page.locator("form").getByText("Key")).toBeVisible();
  await expect(page.getByRole("cell", { name: "Play / Pause" })).toBeVisible();
  await expect(page.locator("thead")).toContainText("Play / Pause");
  await expect(page.getByRole("cell", { name: "Waveform" })).toBeVisible();
  await expect(page.locator("thead")).toContainText("Waveform");
  await expect(page.getByRole("cell", { name: "Volume" })).toBeVisible();
  await expect(page.locator("thead")).toContainText("Volume");
  await expect(page.getByRole("cell", { name: "Pitch" })).toBeVisible();
  await expect(page.locator("thead")).toContainText("Pitch");
  await expect(page.getByRole("cell", { name: "Title" })).toBeVisible();
  await expect(page.locator("thead")).toContainText("Title");
  await expect(page.getByRole("cell", { name: "Key" })).toBeVisible();
  await expect(page.locator("thead")).toContainText("Key");
  await expect(
    page.getByRole("cell", { name: "BPM", exact: true }),
  ).toBeVisible();
  await expect(page.locator("thead")).toContainText("BPM");
  await expect(page.getByRole("cell", { name: "Genres" })).toBeVisible();
  await expect(page.locator("thead")).toContainText("Genres");
  await expect(page.getByRole("cell", { name: "Instruments" })).toBeVisible();
  await expect(page.locator("thead")).toContainText("Instruments");
  await expect(page.getByRole("cell", { name: "Author" })).toBeVisible();
  await expect(page.locator("thead")).toContainText("Author");
  await expect(
    page.locator("thead").getByRole("cell", { name: "Save" }),
  ).toBeVisible();
  await expect(page.locator("thead")).toContainText("Save");
  await expect(
    page
      .getByRole("row", { name: "Play 0.5 1 Cymatics - Odyssey" })
      .getByLabel("Play"),
  ).toBeVisible();
  await page
    .getByRole("row", { name: "Play 0.5 1 Cymatics - Odyssey" })
    .getByLabel("Play")
    .click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  await page.getByRole("button", { name: "Pause" }).click();
  await expect(
    page
      .getByRole("row", { name: "Play 0.5 1 Cymatics - Odyssey" })
      .getByLabel("Play"),
  ).toBeVisible();
  await expect(page.locator("canvas").first()).toBeVisible();
  await expect(page.getByRole("slider").first()).toBeVisible();
  await expect(page.getByRole("slider").nth(1)).toBeVisible();
  await expect(page.getByRole("button", { name: "Saved" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save" }).nth(1)).toBeVisible();
  await expect(page.getByText("Created By You")).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save" }).nth(2)).toBeVisible();
  await page.locator("div").filter({ hasText: "Play /" }).click();
  await expect(page.locator("div").filter({ hasText: "Play /" })).toBeVisible();
});
