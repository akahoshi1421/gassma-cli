import { getOneGassmaCreateManyAndReturnData } from "../../../generate/typeGenerate/gassmaCreateMany/oneGassmaCreateManyAndReturnData";

describe("getOneGassmaCreateManyAndReturnData", () => {
  it("should generate CreateManyAndReturnData type", () => {
    const result = getOneGassmaCreateManyAndReturnData("", "User");

    expect(result).toContain("export type GassmaUserCreateManyAndReturnData");
  });

  it("should include data property", () => {
    const result = getOneGassmaCreateManyAndReturnData("", "User");

    expect(result).toContain("data: GassmaUserUse[]");
  });

  it("should include include property", () => {
    const result = getOneGassmaCreateManyAndReturnData("", "User");

    expect(result).toContain("include?: GassmaUserInclude");
  });

  it("should include select and omit as mutually exclusive", () => {
    const result = getOneGassmaCreateManyAndReturnData("", "User");

    expect(result).toContain("select?: GassmaUserSelect; omit?: never");
    expect(result).toContain("select?: never; omit?: GassmaUserOmit");
  });
});
