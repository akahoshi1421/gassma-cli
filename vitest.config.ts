import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/__test__/**/*.test.ts"],
    typecheck: {
      // 型レベルテスト（*.test-d.ts）。通常 run では無効、test:types で有効化
      enabled: false,
      include: ["src/__test__/**/*.test-d.ts"],
      tsconfig: "./tsconfig.json",
    },
  },
});
