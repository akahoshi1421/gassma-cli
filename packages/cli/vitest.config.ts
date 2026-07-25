import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/__test__/**/*.test.ts"],
    server: {
      // ci-info computes isCI at import time; inlining lets vi.resetModules
      // re-evaluate it under a stubbed env in the detectCi wiring probes.
      deps: {
        inline: ["ci-info"],
      },
    },
    typecheck: {
      enabled: false,
      include: ["src/__test__/types/**/*.test-d.ts"],
    },
  },
});
