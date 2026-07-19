import { describe, it, expect } from "vitest";
import { getOneGassmaGroupByData } from "../../../generate/typeGenerate/gassmaGroupByData/oneGassmaGroupByData";

describe("getOneGassmaGroupByData", () => {
  it("should extend AggregateData without cursor, with by + having", () => {
    const result = getOneGassmaGroupByData(
      { id: [1], name: ["a"] },
      "",
      "User",
    );
    expect(result).toContain(
      'export type GassmaUserGroupByData = Omit<GassmaUserAggregateData, "cursor"> & {',
    );
    expect(result).toContain("by:");
    expect(result).toContain("having?: GassmaUserHavingUse;");
  });

  it("should include all column names as by union", () => {
    const result = getOneGassmaGroupByData(
      { id: [1], name: ["a"] },
      "",
      "User",
    );
    expect(result).toContain('"id"');
    expect(result).toContain('"name"');
  });

  it("should strip trailing ? from column names", () => {
    const result = getOneGassmaGroupByData({ "name?": ["a"] }, "", "User");
    expect(result).toContain('"name"');
    expect(result).not.toContain('"name?"');
  });

  it("should prepend schemaName", () => {
    const result = getOneGassmaGroupByData({ id: [1] }, "Test", "User");
    expect(result).toContain("export type GassmaTestUserGroupByData");
    expect(result).toContain('Omit<GassmaTestUserAggregateData, "cursor">');
    expect(result).toContain("GassmaTestUserHavingUse");
  });
});
