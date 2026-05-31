import { describe, it, expect } from "vitest";
import { getOneGassmaAggregateBaseReturn } from "../../../generate/typeGenerate/gassmaAggregateBaseReturn/oneGassmaAggregateBaseReturn";

describe("getOneGassmaAggregateBaseReturn", () => {
  it("should emit AggregateBaseReturn declaration", () => {
    const result = getOneGassmaAggregateBaseReturn({}, "", "User");
    expect(result).toContain("export type GassmaUserAggregateBaseReturn = {");
  });

  it("should include numeric columns with aggregate type", () => {
    const result = getOneGassmaAggregateBaseReturn(
      { price: [1, 2, 3] },
      "",
      "Product",
    );
    expect(result).toContain('"price":');
  });

  it("should preserve special type hints (string/Date/boolean) as aggregate type", () => {
    const result = getOneGassmaAggregateBaseReturn(
      { when: ["Date", "Date"] },
      "",
      "User",
    );
    expect(result).toContain('"when": Date');
  });

  it("should prepend schemaName", () => {
    const result = getOneGassmaAggregateBaseReturn({}, "Test", "User");
    expect(result).toContain("export type GassmaTestUserAggregateBaseReturn");
  });
});
