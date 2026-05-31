import { describe, it, expect } from "vitest";
import { getOneGassmaHavingUse } from "../../../generate/typeGenerate/gassmaHavingUse/oneGassmaHavingUse";

describe("getOneGassmaHavingUse", () => {
  it("should emit HavingUse with each column referencing the column HavingCore", () => {
    const result = getOneGassmaHavingUse({ name: ["a"] }, "", "User");
    expect(result).toContain("export type GassmaUserHavingUse = {");
    expect(result).toContain('"name"?:');
    expect(result).toContain("GassmaUsernameHavingCore");
  });

  it("should append | null for optional columns (trailing ?)", () => {
    const result = getOneGassmaHavingUse({ "name?": ["a"] }, "", "User");
    expect(result).toContain(" | null |");
    expect(result).not.toContain('"name?"');
  });

  it("should include AND / OR / NOT logical operators", () => {
    const result = getOneGassmaHavingUse({ id: [1] }, "", "User");
    expect(result).toContain(
      "AND?: GassmaUserHavingUse[] | GassmaUserHavingUse;",
    );
    expect(result).toContain("OR?: GassmaUserHavingUse[];");
    expect(result).toContain(
      "NOT?: GassmaUserHavingUse[] | GassmaUserHavingUse;",
    );
  });

  it("should prepend schemaName", () => {
    const result = getOneGassmaHavingUse({ id: [1] }, "Test", "User");
    expect(result).toContain("GassmaTestUserHavingUse");
  });
});
