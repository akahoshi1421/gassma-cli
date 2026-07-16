import { describe, it, expect } from "vitest";
import { getOneGassmaAggregateData } from "../../../generate/typeGenerate/gassmaAggregateData/oneGassmaAggregateData";

describe("getOneGassmaAggregateData", () => {
  it("should generate AggregateData type with cursor property", () => {
    const result = getOneGassmaAggregateData("", "User");

    expect(result).toContain("export type GassmaUserAggregateData");
    expect(result).toContain("cursor?: Partial<GassmaUserUse>;");
  });

  it("should generate AggregateData type with schema name", () => {
    const result = getOneGassmaAggregateData("App", "User");

    expect(result).toContain("export type GassmaAppUserAggregateData");
    expect(result).toContain("cursor?: Partial<GassmaAppUserUse>;");
  });

  it("should restrict _avg and _sum to numeric fields via NumberSelect", () => {
    const result = getOneGassmaAggregateData("", "User");

    expect(result).toContain("_avg?: GassmaUserNumberSelect;");
    expect(result).toContain("_sum?: GassmaUserNumberSelect;");
  });

  it("should keep _count, _max and _min as full Select", () => {
    const result = getOneGassmaAggregateData("", "User");

    expect(result).toContain("_count?: GassmaUserSelect;");
    expect(result).toContain("_max?: GassmaUserSelect;");
    expect(result).toContain("_min?: GassmaUserSelect;");
  });
});
