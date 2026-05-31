import { describe, it, expect } from "vitest";
import { getOneGassmaHavingCore } from "../../../generate/typeGenerate/gassmaHavingCore/oneGassmaHavingCore";

describe("getOneGassmaHavingCore", () => {
  it("should emit a HavingCore type per column", () => {
    const result = getOneGassmaHavingCore({ id: [1], name: ["a"] }, "", "User");
    expect(result).toContain("export type GassmaUseridHavingCore");
    // Note: getRemovedCantUseVarChar removes some characters; column names appear concatenated
    expect(result).toContain("HavingCore = {");
  });

  it("should include _avg / _count / _max / _min / _sum + base intersection", () => {
    const result = getOneGassmaHavingCore({ id: [1] }, "", "User");
    expect(result).toContain("_avg?:");
    expect(result).toContain("_count?:");
    expect(result).toContain("_max?:");
    expect(result).toContain("_min?:");
    expect(result).toContain("_sum?:");
    expect(result).toContain("FilterConditions;");
    expect(result).toContain("} & GassmaUseridFilterConditions;");
  });

  it("should prepend schemaName", () => {
    const result = getOneGassmaHavingCore({ id: [1] }, "Test", "User");
    expect(result).toContain("GassmaTestUseridHavingCore");
  });

  it("should produce empty string when no columns", () => {
    expect(getOneGassmaHavingCore({}, "", "User")).toBe("");
  });
});
