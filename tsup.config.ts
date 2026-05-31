import { defineConfig } from "tsup";

// tsc から tsup へ移行。src の各 .ts を個別の .js + .d.ts に出力する（bundle はしない）。
// dist 構造を tsc 時代と同一に保ち、package.json の exports（個別ファイル参照）を壊さない。
export default defineConfig({
  entry: ["src/**/*.ts", "!src/__test__/**"],
  format: ["cjs"],
  dts: true,
  outDir: "dist",
  clean: true,
  target: "es2016",
  bundle: false,
  splitting: false,
  sourcemap: false,
});
