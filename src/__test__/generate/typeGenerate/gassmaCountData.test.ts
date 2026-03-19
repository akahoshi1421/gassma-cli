import { getOneGassmaCountData } from "../../../generate/typeGenerate/gassmaCountData/oneGassmaCountData";

describe("getOneGassmaCountData", () => {
  it("should generate CountData type with cursor property", () => {
    const result = getOneGassmaCountData("", "User");

    expect(result).toContain("export type GassmaUserCountData");
    expect(result).toContain("cursor?: Partial<GassmaUserUse>;");
  });

  it("should generate CountData type with schema name", () => {
    const result = getOneGassmaCountData("App", "User");

    expect(result).toContain("export type GassmaAppUserCountData");
    expect(result).toContain("cursor?: Partial<GassmaAppUserUse>;");
  });
});
