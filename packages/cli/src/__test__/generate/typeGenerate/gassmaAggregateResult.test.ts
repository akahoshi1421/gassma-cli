import { describe, it, expect } from "vitest";
import { getOneGassmaAggregateResult } from "../../../generate/typeGenerate/gassmaAggregateResult/oneGassmaAggregateResult";

describe("getOneGassmaAggregateResult", () => {
  it("should declare AggregateResult with T extends AggregateData", () => {
    const result = getOneGassmaAggregateResult("", "User");
    expect(result).toContain(
      "export type GassmaUserAggregateResult<T extends GassmaUserAggregateData>",
    );
  });

  it("should filter keys by _avg/_count/_max/_min/_sum", () => {
    const result = getOneGassmaAggregateResult("", "User");
    expect(result).toContain(
      'K extends "_avg" | "_count" | "_max" | "_min" | "_sum"',
    );
  });

  it("should resolve each key via AggregateField<T[K], K>", () => {
    const result = getOneGassmaAggregateResult("", "User");
    expect(result).toContain("GassmaUserAggregateField<T[K], K>");
  });

  it("should map undefined to never", () => {
    const result = getOneGassmaAggregateResult("", "User");
    expect(result).toContain("T[K] extends undefined");
    expect(result).toContain("? never");
  });

  it("should prepend schemaName", () => {
    const result = getOneGassmaAggregateResult("Test", "User");
    expect(result).toContain("export type GassmaTestUserAggregateResult");
    expect(result).toContain("GassmaTestUserAggregateField");
  });
});
