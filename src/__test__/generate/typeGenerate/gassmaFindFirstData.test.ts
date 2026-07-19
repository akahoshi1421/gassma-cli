import { describe, it, expect } from "vitest";
import { getOneGassmaFindFirstData } from "../../../generate/typeGenerate/gassmaFindData/oneGassmaFindFirstData";

describe("getOneGassmaFindFirstData", () => {
  const sheetContent = { id: ["number"], name: ["string"] };

  it("should generate FindFirstData type", () => {
    const result = getOneGassmaFindFirstData(sheetContent, "", "User");

    expect(result).toContain("export type GassmaUserFindFirstData");
  });

  it("should include where, orderBy, include, cursor", () => {
    const result = getOneGassmaFindFirstData(sheetContent, "", "User");

    expect(result).toContain("where?: GassmaUserWhereUse");
    expect(result).toContain("orderBy?: GassmaUserOrderBy");
    expect(result).toContain("include?: GassmaUserInclude");
    expect(result).toContain("cursor?: Partial<GassmaUserUse>");
  });

  it("should include _count property", () => {
    const result = getOneGassmaFindFirstData(sheetContent, "", "User");

    expect(result).toContain("_count?: GassmaUserCountValue");
  });

  it("should include take and skip", () => {
    const result = getOneGassmaFindFirstData(sheetContent, "", "User");

    expect(result).toContain("take?: number;");
    expect(result).toContain("skip?: number;");
  });

  it("should include distinct as column union (single and array)", () => {
    const result = getOneGassmaFindFirstData(sheetContent, "", "User");

    expect(result).toContain('distinct?: "id" | "name" | ("id" | "name")[];');
  });

  it("should strip trailing question marks from distinct columns", () => {
    const result = getOneGassmaFindFirstData(
      { id: ["number"], "name?": ["string"] },
      "",
      "User",
    );

    expect(result).toContain('distinct?: "id" | "name" | ("id" | "name")[];');
  });

  it("should make select and omit mutually exclusive", () => {
    const result = getOneGassmaFindFirstData(sheetContent, "", "User");

    expect(result).toContain("select?: GassmaUserFindSelect; omit?: never");
    expect(result).toContain("select?: never; omit?: GassmaUserOmit");
  });
});
