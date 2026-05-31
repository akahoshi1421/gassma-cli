import { describe, it, expect } from "vitest";
import { getOneGassmaDefaultFindResult } from "../../../generate/typeGenerate/gassmaDefaultFindResult/oneGassmaDefaultFindResult";

describe("getOneGassmaDefaultFindResult", () => {
  it("should emit DefaultFindResult as alias of CreateReturn", () => {
    const result = getOneGassmaDefaultFindResult("", "User");
    expect(result).toContain(
      "export type GassmaUserDefaultFindResult = GassmaUserCreateReturn;",
    );
  });

  it("should prepend schemaName to both sides of the alias", () => {
    const result = getOneGassmaDefaultFindResult("Test", "User");
    expect(result).toContain(
      "export type GassmaTestUserDefaultFindResult = GassmaTestUserCreateReturn;",
    );
  });
});
