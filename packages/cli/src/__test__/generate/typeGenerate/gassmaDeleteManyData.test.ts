import { describe, it, expect } from "vitest";
import { getOneGassmaDeleteData } from "../../../generate/typeGenerate/gassmaDeleteManyData/oneGassmaDeleteManyData";

describe("getOneGassmaDeleteData", () => {
  it("should generate DeleteData type", () => {
    const result = getOneGassmaDeleteData("", "User");

    expect(result).toContain("export type GassmaUserDeleteData");
  });

  it("should have optional where property (deleteMany without where targets all rows)", () => {
    const result = getOneGassmaDeleteData("", "User");

    expect(result).toContain("where?: GassmaUserWhereUse;");
  });

  it("should include limit property", () => {
    const result = getOneGassmaDeleteData("", "User");

    expect(result).toContain("limit?: number;");
  });
});
