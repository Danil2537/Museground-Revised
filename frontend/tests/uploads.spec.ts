import { test, expect } from "@playwright/test";

test.use({
  storageState: "storageState.json",
});
test("test", async ({ page }) => {
  await page.goto("http://localhost:3000/login");
  await expect(page.locator("body")).toMatchAriaSnapshot(`
    - heading "Login" [level=1]
    - textbox "Username":
      - /placeholder: " "
    - text: Username
    - textbox "Password":
      - /placeholder: " "
    - text: Password
    - button "Sign In"
    - button "Sign in with Google"
    - button "Register"
    `);
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Username" })).toBeVisible();
  await expect(page.getByText("Username")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
  await expect(page.getByText("Password")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sign In", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sign in with Google" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
  await page.getByText("Username").click();
  await page.getByRole("textbox", { name: "Username" }).fill("testname");
  await expect(page.getByText("Username")).toBeVisible();
  await page.getByText("Password").click();
  await page.getByRole("textbox", { name: "Password" }).fill("testpass");
  await expect(page.getByText("Password")).toBeVisible();
  await page.getByRole("button", { name: "Sign In", exact: true }).click();

  await page.getByRole("link", { name: "Upload" }).click();
  await page.locator("html").click();
  await page.getByRole("link", { name: "Upload" }).click();
  await expect(
    page.getByRole("heading", { name: "Upload New Sample" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Title" })).toBeVisible();
  await expect(page.getByRole("spinbutton", { name: "BPM" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Key" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Genres" })).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Instruments" }),
  ).toBeVisible();
  await expect(page.getByText("Click to upload or drag and")).toBeVisible();
  await page.getByText("Title").click();
  await page.getByText("BPM").click();
  await page.getByText("Key").click();
  await page.getByText("Genres").click();
  await page.getByText("Instruments").click();
  await page.getByRole("textbox", { name: "Title" }).click();
  await page.getByRole("textbox", { name: "Title" }).fill("text");
  await page.getByRole("spinbutton", { name: "BPM" }).click();
  await page.getByRole("spinbutton", { name: "BPM" }).fill("123");
  await page.getByText("Key").click();
  await page.getByRole("textbox", { name: "Key" }).fill("C");
  await page.getByText("Genres").click();
  await page.getByRole("textbox", { name: "Genres" }).fill("text");
  await page.getByText("Instruments").click();
  await page.getByRole("textbox", { name: "Instruments" }).fill("text");
  await expect(page.getByText("Title")).toBeVisible();

  await page.getByRole("link", { name: "Presets" }).click();
  await expect(
    page.getByRole("heading", { name: "Upload a New Preset" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Name" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Vst" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Genres" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Types" })).toBeVisible();
  await expect(page.getByText("Preset File")).toBeVisible();
  await expect(page.locator('input[name="presetFile"]')).toBeVisible();
  await expect(page.getByText("Sound File")).toBeVisible();
  await expect(page.locator('input[name="soundFile"]')).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Upload Preset" }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Name" }).click();
  await page.getByRole("textbox", { name: "Vst" }).click();
  await page.getByText("Genres").click();
  await page.getByText("Types").click();

  await page.getByRole("link", { name: "Packs" }).click();
  await expect(
    page.getByRole("heading", { name: "Upload New Pack" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Pack name" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Pack" })).toBeVisible();
  await page.getByRole("textbox", { name: "Pack name" }).click();
  await page.getByRole("textbox", { name: "Pack name" }).fill("text");
  await expect(page.getByRole("textbox", { name: "Pack name" })).toBeVisible();
});
