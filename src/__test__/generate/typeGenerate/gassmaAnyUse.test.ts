import { describe, it, expect } from "vitest";
import { getOneGassmaAnyUse } from "../../../generate/typeGenerate/gassmaAnyUse/oneGassmaAnyUse";

describe("getOneGassmaAnyUse", () => {
  it("should emit Use with required column having no ?", () => {
    const result = getOneGassmaAnyUse({ id: [1] }, "", "User");
    expect(result).toContain("export type GassmaUserUse = {");
    expect(result).toContain('"id":');
    expect(result).not.toContain('"id"?:');
  });

  it("should mark optional columns (trailing ?) with ?", () => {
    const result = getOneGassmaAnyUse({ "name?": ["a"] }, "", "User");
    expect(result).toContain('"name"?:');
    expect(result).not.toContain('"name?"');
  });

  it("should prepend schemaName", () => {
    const result = getOneGassmaAnyUse({ id: [1] }, "Test", "User");
    expect(result).toContain("export type GassmaTestUserUse");
  });
});
