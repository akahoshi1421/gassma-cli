import { getOneGassmaDeleteData } from "../../../generate/typeGenerate/gassmaDeleteManyData/oneGassmaDeleteManyData";

describe("getOneGassmaDeleteData", () => {
  it("should generate DeleteData type", () => {
    const result = getOneGassmaDeleteData("", "User");

    expect(result).toContain("export type GassmaUserDeleteData");
  });

  it("should include where property", () => {
    const result = getOneGassmaDeleteData("", "User");

    expect(result).toContain("where: GassmaUserWhereUse;");
  });

  it("should include limit property", () => {
    const result = getOneGassmaDeleteData("", "User");

    expect(result).toContain("limit?: number;");
  });
});
