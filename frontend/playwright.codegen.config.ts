import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  use: {
    baseURL: "http://localhost:3000",
    storageState: "storageState.json",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // IMPORTANT: setup script for codegen
  globalSetup: "./tests/utils/codegen.setup.ts",
});
