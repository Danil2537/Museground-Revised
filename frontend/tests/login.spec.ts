import { test, expect } from "@playwright/test";

test("login page", async ({ page }) => {
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
  await expect(page.getByRole("textbox", { name: "Username" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sign In", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sign in with Google" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
  await expect(page.getByRole("heading")).toContainText("Login");
  await expect(page.locator("form")).toContainText("Username");
  await expect(page.locator("form")).toContainText("Password");
  await expect(page.locator("form")).toContainText("Sign In");
  await expect(page.locator("body")).toContainText("Sign in with Google");
  await expect(page.locator("body")).toContainText("Register");
  await page.getByRole("textbox", { name: "Username" }).click();
  await expect(page.getByText("Username")).toBeVisible();
  await page.getByRole("textbox", { name: "Password" }).click();
  await expect(page.getByText("Password")).toBeVisible();
  await page.getByRole("textbox", { name: "Username" }).click();
  await page.getByRole("textbox", { name: "Username" }).fill("qweqwrerq");
  await expect(page.getByRole("textbox", { name: "Username" })).toBeVisible();
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("cdsavs");
  await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
});
