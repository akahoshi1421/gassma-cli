import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    command: "src/command.ts",
    "config/defineConfig": "src/config/defineConfig.ts",
  },
  format: ["cjs"],
  dts: true,
  outDir: "dist",
  clean: true,
  target: "es2016",
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
});
