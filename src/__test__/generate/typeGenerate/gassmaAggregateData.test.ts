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
});
