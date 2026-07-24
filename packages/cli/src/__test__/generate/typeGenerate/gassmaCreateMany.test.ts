import { describe, it, expect } from "vitest";
import { getOneGassmaCreateMany } from "../../../generate/typeGenerate/gassmaCreateMany/oneGassmaCreateMany";

describe("getOneGassmaCreateMany", () => {
  it("should emit CreateManyData with data array of Use", () => {
    const result = getOneGassmaCreateMany("", "User");
    expect(result).toContain("export type GassmaUserCreateManyData = {");
    expect(result).toContain("data: GassmaUserUse[];");
  });

  it("should prepend schemaName", () => {
    const result = getOneGassmaCreateMany("Test", "User");
    expect(result).toContain("export type GassmaTestUserCreateManyData");
    expect(result).toContain("GassmaTestUserUse[]");
  });
});
