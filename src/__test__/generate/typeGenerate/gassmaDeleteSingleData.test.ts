import { getOneGassmaDeleteSingleData } from "../../../generate/typeGenerate/gassmaDeleteManyData/oneGassmaDeleteSingleData";

describe("getOneGassmaDeleteSingleData", () => {
  it("should generate DeleteSingleData type", () => {
    const result = getOneGassmaDeleteSingleData("", "User");

    expect(result).toContain("declare type GassmaUserDeleteSingleData");
  });

  it("should include where property", () => {
    const result = getOneGassmaDeleteSingleData("", "User");

    expect(result).toContain("where: GassmaUserWhereUse;");
  });

  it("should include select property", () => {
    const result = getOneGassmaDeleteSingleData("", "User");

    expect(result).toContain("select?: GassmaUserSelect;");
  });

  it("should include include property", () => {
    const result = getOneGassmaDeleteSingleData("", "User");

    expect(result).toContain("include?: Gassma.IncludeData;");
  });

  it("should include omit property", () => {
    const result = getOneGassmaDeleteSingleData("", "User");

    expect(result).toContain("omit?: GassmaUserOmit;");
  });
});
