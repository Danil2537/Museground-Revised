import { test, expect } from "@playwright/test";

test("register page", async ({ page }) => {
  await page.goto("http://localhost:3000/register");
  await expect(page.locator("body")).toMatchAriaSnapshot(`
    - heading "Register" [level=1]
    - textbox "Username":
      - /placeholder: " "
    - text: Username
    - textbox "Email Address":
      - /placeholder: " "
    - text: Email Address
    - textbox "Password":
      - /placeholder: " "
    - text: Password
    - textbox:
      - /placeholder: " "
    - text: Confirm Password
    - button "Register"
    - button "Log In"
    `);
  await expect(page.getByRole("textbox", { name: "Username" })).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Email Address" }),
  ).toBeVisible();
  await expect(page.getByText("Password", { exact: true })).toBeVisible();
  await expect(page.locator("#confirmedPassword")).toBeVisible();
  await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
  await expect(page.locator("form")).toContainText("Register");
  await expect(page.locator("form")).toContainText("Log In");
  await expect(page.getByRole("button", { name: "Log In" })).toBeVisible();
  await expect(page.getByRole("heading")).toContainText("Register");
  await page.getByRole("textbox", { name: "Username" }).click();
  await page.getByRole("textbox", { name: "Username" }).fill("text");
  await expect(page.getByText("Username")).toBeVisible();
  await page.getByText("Email Address").click();
  await page.getByRole("textbox", { name: "Email Address" }).fill("text");
  await expect(page.getByText("Email Address")).toBeVisible();
  await page.getByText("Password", { exact: true }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("text");
  await expect(page.getByText("Password", { exact: true })).toBeVisible();
  await page.locator("#confirmedPassword").click();
  await page.locator("#confirmedPassword").fill("text");
  await expect(page.getByText("Confirm Password")).toBeVisible();
});
