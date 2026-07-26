import { describe, expect, it } from "vitest";
import { loadBootstrapTemplates } from "../../../bootstrap/env/loadBootstrapTemplates";

describe("loadBootstrapTemplates", () => {
  it("should load every bundled template", () => {
    const templates = loadBootstrapTemplates();

    expect(templates.gitignore).toContain(".clasp.json");
    expect(templates.tsconfig).toContain("google-apps-script");
    expect(templates.packageJson).toContain('"gassma"');
    expect(templates.esbuild.export).toContain("gasEsbuildPlugin");
    expect(templates.esbuild.global).toContain("GasPlugin");
    expect(templates.sampleIndex.export).toContain("export const main");
    expect(templates.sampleIndex.global).toContain("global.main = main;");
  });
});
