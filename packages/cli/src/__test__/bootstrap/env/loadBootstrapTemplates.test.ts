import { describe, expect, it } from "vitest";
import { loadBootstrapTemplates } from "../../../bootstrap/env/loadBootstrapTemplates";

describe("loadBootstrapTemplates", () => {
  it("should load every bundled template", () => {
    const templates = loadBootstrapTemplates();

    expect(templates.gitignore).toContain(".clasp.json");
    expect(templates.agentsMd).toContain("# GAS project (Clasp + GASsma)");
    expect(templates.tsconfig).toContain("google-apps-script");
    expect(templates.packageJson).toContain('"gassma"');
    expect(templates.esbuild.export).toContain("gasEsbuildPlugin");
    expect(templates.esbuild.global).toContain("GasPlugin");
    expect(templates.sampleIndex.export).toContain("export const main");
    expect(templates.sampleIndex.global).toContain("global.main = main;");
  });

  it("should load the linter templates", () => {
    const templates = loadBootstrapTemplates();

    expect(JSON.parse(templates.oxlintrc)).toEqual({
      plugins: ["typescript"],
      categories: { correctness: "error" },
      ignorePatterns: ["dist/**", "src/generated/**"],
    });
    expect(templates.eslintConfig).toContain("typescript-eslint");
    expect(templates.eslintConfig).toContain("eslint-config-prettier");
    expect(templates.eslintConfig).toContain("src/generated/**");
    expect(() => JSON.parse(templates.prettierrc)).not.toThrow();
  });
});
