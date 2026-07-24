import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/**/*.ts", "!src/__test__/**"],
  format: ["cjs"],
  dts: true,
  unbundle: true,
  outDir: "dist",
  clean: true,
  target: "es2016",
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
});
