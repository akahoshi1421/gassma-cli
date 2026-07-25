import { describe, expect, it } from "vitest";
import { generateSampleIndex } from "../../../bootstrap/generators/generateSampleIndex";

describe("generateSampleIndex", () => {
  it("should export a main function for the export style", () => {
    const sample = generateSampleIndex("export");

    expect(sample).toBe(
      'export const main = () => console.log("Hello GAS!");\n',
    );
  });

  it("should assign main to global for the global style", () => {
    const sample = generateSampleIndex("global");

    expect(sample).toContain('const main = () => console.log("Hello GAS!");');
    expect(sample).toContain("interface Global {");
    expect(sample).toContain("main: typeof main;");
    expect(sample).toContain("declare const global: Global;");
    expect(sample).toContain("global.main = main;");
    expect(sample).not.toContain("export");
  });

  it("should end with a newline for both styles", () => {
    expect(generateSampleIndex("export").endsWith("\n")).toBe(true);
    expect(generateSampleIndex("global").endsWith("\n")).toBe(true);
  });
});
