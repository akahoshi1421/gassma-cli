import { getOneGassmaFindFirstData } from "../../../generate/typeGenerate/gassmaFindData/oneGassmaFindFirstData";

describe("getOneGassmaFindFirstData", () => {
  it("should generate FindFirstData type", () => {
    const result = getOneGassmaFindFirstData("", "User");

    expect(result).toContain("export type GassmaUserFindFirstData");
  });

  it("should include where, orderBy, include, cursor", () => {
    const result = getOneGassmaFindFirstData("", "User");

    expect(result).toContain("where?: GassmaUserWhereUse");
    expect(result).toContain("orderBy?: GassmaUserOrderBy");
    expect(result).toContain("include?: GassmaUserInclude");
    expect(result).toContain("cursor?: Partial<GassmaUserUse>");
  });

  it("should include _count property", () => {
    const result = getOneGassmaFindFirstData("", "User");

    expect(result).toContain("_count?: GassmaUserCountValue");
  });

  it("should NOT include take, skip, or distinct", () => {
    const result = getOneGassmaFindFirstData("", "User");

    expect(result).not.toContain("take?:");
    expect(result).not.toContain("skip?:");
    expect(result).not.toContain("distinct?:");
  });

  it("should make select and omit mutually exclusive", () => {
    const result = getOneGassmaFindFirstData("", "User");

    expect(result).toContain("select?: GassmaUserFindSelect; omit?: never");
    expect(result).toContain("select?: never; omit?: GassmaUserOmit");
  });
});
