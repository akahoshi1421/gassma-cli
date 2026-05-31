import { describe, it, expect } from "vitest";
import { getOneGassmaGroupByResult } from "../../../generate/typeGenerate/gassmaGroupByResult/oneGassmaGroupByResult";

describe("getOneGassmaGroupByResult", () => {
  it("should declare GroupByResult with T extends GroupByData", () => {
    const result = getOneGassmaGroupByResult("", "User");
    expect(result).toContain(
      "export type GassmaUserGroupByResult<T extends GassmaUserGroupByData>",
    );
  });

  it("should intersect ByField<T['by']> with aggregate keys mapping", () => {
    const result = getOneGassmaGroupByResult("", "User");
    expect(result).toContain('GassmaUserByField<T["by"]>');
    expect(result).toContain(
      'K extends "_avg" | "_count" | "_max" | "_min" | "_sum"',
    );
  });

  it("should resolve each key via AggregateField<T[K], K>", () => {
    const result = getOneGassmaGroupByResult("", "User");
    expect(result).toContain("GassmaUserAggregateField<T[K], K>");
  });

  it("should prepend schemaName", () => {
    const result = getOneGassmaGroupByResult("Test", "User");
    expect(result).toContain("export type GassmaTestUserGroupByResult");
    expect(result).toContain("GassmaTestUserByField");
  });
});
