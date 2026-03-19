import { getOneGassmaDeleteSingleData } from "../../../generate/typeGenerate/gassmaDeleteManyData/oneGassmaDeleteSingleData";

describe("getOneGassmaDeleteSingleData", () => {
  it("should generate DeleteSingleData type", () => {
    const result = getOneGassmaDeleteSingleData("", "User");

    expect(result).toContain("export type GassmaUserDeleteSingleData");
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

    expect(result).toContain("include?: GassmaUserInclude;");
  });

  it("should include omit property", () => {
    const result = getOneGassmaDeleteSingleData("", "User");

    expect(result).toContain("omit?: GassmaUserOmit");
  });

  it("should make select and omit mutually exclusive", () => {
    const result = getOneGassmaDeleteSingleData("", "User");

    expect(result).toContain("select?: GassmaUserSelect; omit?: never");
    expect(result).toContain("select?: never; omit?: GassmaUserOmit");
  });
});
