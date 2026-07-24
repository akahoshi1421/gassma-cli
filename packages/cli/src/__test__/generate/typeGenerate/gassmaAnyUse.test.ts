import { describe, it, expect } from "vitest";
import { getOneGassmaAnyUse } from "../../../generate/typeGenerate/gassmaAnyUse/oneGassmaAnyUse";

describe("getOneGassmaAnyUse", () => {
  it("should emit Use with required column having no ?", () => {
    const result = getOneGassmaAnyUse({ id: [1] }, "", "User");
    expect(result).toContain("export type GassmaUserUse = {");
    expect(result).toContain('"id":');
    expect(result).not.toContain('"id"?:');
  });

  it("should append | null for nullable columns (trailing ?)", () => {
    const result = getOneGassmaAnyUse({ "name?": ["a"] }, "", "User");
    expect(result).toContain("| null");
    expect(result).not.toContain('"name?"');
  });

  it("should mark omittable fields with ? (from optionalFields)", () => {
    const result = getOneGassmaAnyUse({ isActive: ["boolean"] }, "", "User", [
      "isActive",
    ]);
    expect(result).toContain('"isActive"?: boolean;');
  });

  it("should keep required fields without ? when not in optionalFields", () => {
    const result = getOneGassmaAnyUse({ name: ["string"] }, "", "User", []);
    expect(result).toContain('"name": string;');
  });

  it("should prepend schemaName", () => {
    const result = getOneGassmaAnyUse({ id: [1] }, "Test", "User");
    expect(result).toContain("export type GassmaTestUserUse");
  });
});
