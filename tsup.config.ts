import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/**/*.ts", "!src/__test__/**"],
  format: ["cjs"],
  dts: false,
  outDir: "dist",
  clean: true,
  target: "es2016",
  bundle: false,
  splitting: false,
  sourcemap: false,
});
