import { describe, it, expect } from "vitest";
import { getOneGassmaGroupByBaseReturn } from "../../../generate/typeGenerate/gassmaGroupByBaseReturn/oneGassmaGroupByBaseReturn";

describe("getOneGassmaGroupByBaseReturn", () => {
  it("should emit alias of CreateReturn", () => {
    const result = getOneGassmaGroupByBaseReturn("", "User");
    expect(result).toContain(
      "export type GassmaUserGroupByBaseReturn = GassmaUserCreateReturn;",
    );
  });

  it("should prepend schemaName to both sides", () => {
    const result = getOneGassmaGroupByBaseReturn("Test", "User");
    expect(result).toContain(
      "export type GassmaTestUserGroupByBaseReturn = GassmaTestUserCreateReturn;",
    );
  });
});
