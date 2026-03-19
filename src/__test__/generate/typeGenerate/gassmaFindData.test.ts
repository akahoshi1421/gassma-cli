import { getOneGassmaFindData } from "../../../generate/typeGenerate/gassmaFindData/oneGassmaFindData";

describe("getOneGassmaFindData", () => {
  const sheetContent = {
    id: ["number"],
    name: ["string"],
    "email?": ["string"],
  };

  it("should generate FindData type with where, select, omit, orderBy", () => {
    const result = getOneGassmaFindData(sheetContent, "", "User");

    expect(result).toContain("export type GassmaUserFindData");
    expect(result).toContain("where?: GassmaUserWhereUse");
    expect(result).toContain("select?: GassmaUserSelect");
    expect(result).toContain("omit?: GassmaUserOmit");
    expect(result).toContain("orderBy?: GassmaUserOrderBy");
  });

  it("should make select and omit mutually exclusive", () => {
    const result = getOneGassmaFindData(sheetContent, "", "User");

    expect(result).toContain("select?: GassmaUserSelect; omit?: never");
    expect(result).toContain("select?: never; omit?: GassmaUserOmit");
  });

  it("should include take, skip, and distinct", () => {
    const result = getOneGassmaFindData(sheetContent, "", "User");

    expect(result).toContain("take?: number");
    expect(result).toContain("skip?: number");
    expect(result).toContain("distinct?:");
  });

  it("should include model-specific include property", () => {
    const result = getOneGassmaFindData(sheetContent, "", "User");

    expect(result).toContain("include?: GassmaUserInclude");
  });

  it("should include cursor property", () => {
    const result = getOneGassmaFindData(sheetContent, "", "User");

    expect(result).toContain("cursor?: Partial<GassmaUserUse>;");
  });

  it("should include model-specific _count property", () => {
    const result = getOneGassmaFindData(sheetContent, "", "User");

    expect(result).toContain("_count?: GassmaUserCountValue;");
  });
});
