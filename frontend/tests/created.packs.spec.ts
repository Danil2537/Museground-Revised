import { test, expect } from "@playwright/test";

test.use({ storageState: "storageState.json" });

test("created packs page", async ({ page }) => {
  await page.goto("http://localhost:3000/created/packs");
  await expect(
    page.getByRole("heading", { name: "Packs that you Created" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "SampleMusic2000" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Delete Pack" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Add Folder" }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("SampleMusic2000Add FolderAdd FileDelete Folder+"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Add File" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Delete Folder" }).first(),
  ).toBeVisible();
  await expect(page.getByText("+").first()).toBeVisible();
  await page.getByText("+").first().click();
  await expect(page.getByText("Click to upload or drag and")).toBeVisible();
  await expect(page.getByText("soft pads")).toBeVisible();
  await page.getByText("+").first().click();
  await expect(
    page.getByText("Click to upload or drag and").nth(1),
  ).toBeVisible();
  await expect(page.getByText("breath pulse.wav")).toBeVisible();
  await expect(page.locator("canvas").nth(2)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Delete" }).nth(4),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Download" }).nth(1),
  ).toBeVisible();
});
