import { describe, expect, it } from "vitest";
import { generateTsconfig } from "../../../bootstrap/generators/generateTsconfig";

describe("generateTsconfig", () => {
  it("should produce valid JSON ending with a newline", () => {
    const text = generateTsconfig();

    expect(text.endsWith("\n")).toBe(true);
    expect(() => JSON.parse(text)).not.toThrow();
  });

  it("should target esnext lib and include ./src", () => {
    const tsconfig = JSON.parse(generateTsconfig());

    expect(tsconfig.compilerOptions.lib).toEqual(["esnext"]);
    expect(tsconfig.include).toEqual(["./src"]);
  });

  it("should not enable experimentalDecorators", () => {
    const tsconfig = JSON.parse(generateTsconfig());

    expect(tsconfig.compilerOptions.experimentalDecorators).toBeUndefined();
  });

  it("should pin types to google-apps-script (TS 6 no longer auto-includes it)", () => {
    const tsconfig = JSON.parse(generateTsconfig());

    expect(tsconfig.compilerOptions.types).toEqual(["google-apps-script"]);
  });
});
