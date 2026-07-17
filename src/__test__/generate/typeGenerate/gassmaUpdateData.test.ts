import { describe, it, expect } from "vitest";
import { getOneGassmaUpdateData } from "../../../generate/typeGenerate/gassmaUpdateData/oneGassmaUpdateData";

describe("getOneGassmaUpdateData", () => {
  it("should generate UpdateData with Partial NumberOperation support", () => {
    const result = getOneGassmaUpdateData("", "User");

    expect(result).toContain("export type GassmaUserUpdateData");
    expect(result).toContain("Partial<");
    expect(result).toContain(
      "[K in keyof GassmaUserUse]: GassmaUserUse[K] | Gassma.NumberOperation",
    );
  });

  it("should not add nested writes (core updateManyFunc handles scalars only)", () => {
    const result = getOneGassmaUpdateData("", "User");

    expect(result).not.toContain('"posts"?:');
    expect(result).not.toContain("create?:");
    expect(result).not.toContain("connect?:");
  });

  it("should include limit property", () => {
    const result = getOneGassmaUpdateData("", "User");

    expect(result).toContain("limit?: number;");
  });
});
