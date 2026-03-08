import { getOneGassmaFindData } from "../../../generate/typeGenerate/gassmaFindData/oneGassmaFindData";

describe("getOneGassmaFindData", () => {
  const sheetContent = {
    id: ["number"],
    name: ["string"],
    "email?": ["string"],
  };

  it("should generate FindData type with where, select, omit, orderBy", () => {
    const result = getOneGassmaFindData(sheetContent, "User");

    expect(result).toContain("declare type GassmaUserFindData");
    expect(result).toContain("where?: GassmaUserWhereUse");
    expect(result).toContain("select?: GassmaUserSelect");
    expect(result).toContain("omit?: GassmaUserOmit");
    expect(result).toContain("orderBy?: GassmaUserOrderBy");
  });

  it("should include take, skip, and distinct", () => {
    const result = getOneGassmaFindData(sheetContent, "User");

    expect(result).toContain("take?: number");
    expect(result).toContain("skip?: number");
    expect(result).toContain("distinct?:");
  });

  it("should include include property", () => {
    const result = getOneGassmaFindData(sheetContent, "User");

    expect(result).toContain("include?: Gassma.IncludeData");
  });

  it("should include _count property", () => {
    const result = getOneGassmaFindData(sheetContent, "User");

    expect(result).toContain("_count?: Gassma.CountValue;");
  });
});
