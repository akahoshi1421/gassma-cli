import { describe, it, expect } from "vitest";
import { getOneGassmaFindManyData } from "../../../generate/typeGenerate/gassmaFindManyData/oneGassmaFindManyData";

describe("getOneGassmaFindManyData", () => {
  it("should emit FindManyData as alias of FindData", () => {
    const result = getOneGassmaFindManyData("", "User");
    expect(result).toContain(
      "export type GassmaUserFindManyData = GassmaUserFindData;",
    );
  });

  it("should prepend schemaName to both sides", () => {
    const result = getOneGassmaFindManyData("Test", "User");
    expect(result).toContain(
      "export type GassmaTestUserFindManyData = GassmaTestUserFindData;",
    );
  });
});
