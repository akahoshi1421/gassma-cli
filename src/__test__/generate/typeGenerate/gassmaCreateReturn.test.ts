import { describe, it, expect } from "vitest";
import { getOneGassmaCreateReturn } from "../../../generate/typeGenerate/gassmaCreateReturn/oneGassmaCreateReturn";

describe("getOneGassmaCreateReturn", () => {
  it("should generate CreateReturn type with scalar fields", () => {
    const sheetContent = {
      name: ["a", "b", "c"],
    };
    const result = getOneGassmaCreateReturn(sheetContent, "", "User");
    expect(result).toContain("export type GassmaUserCreateReturn = {");
    expect(result).toContain('"name":');
  });

  it("should add | null for optional columns (trailing ?)", () => {
    const sheetContent = {
      "name?": ["a"],
    };
    const result = getOneGassmaCreateReturn(sheetContent, "", "User");
    expect(result).toContain("| null");
    expect(result).not.toContain('"name?"');
  });

  it("should not add | null for required columns", () => {
    const sheetContent = {
      name: ["a"],
    };
    const result = getOneGassmaCreateReturn(sheetContent, "", "User");
    expect(result).not.toContain("| null");
  });

  it("should prepend schemaName to type name", () => {
    const sheetContent = { name: ["a"] };
    const result = getOneGassmaCreateReturn(sheetContent, "Test", "User");
    expect(result).toContain("export type GassmaTestUserCreateReturn");
  });

  it("should emit empty body when sheetContent has no columns", () => {
    const result = getOneGassmaCreateReturn({}, "", "User");
    expect(result).toContain("export type GassmaUserCreateReturn = {");
    expect(result).toContain("};");
  });
});
