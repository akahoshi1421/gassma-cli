import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/__test__/**/*.test.ts"],
    typecheck: {
      // 型レベルテスト（*.test-d.ts）。test:types（vitest --typecheck）で評価。
      // 生成型は pretest:types が __generated__ に出力する。
      enabled: false,
      include: ["src/__test__/types/**/*.test-d.ts"],
      tsconfig: "./tsconfig.test.json",
    },
  },
});
