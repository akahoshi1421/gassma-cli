import { describe, it, expect } from "vitest";
import { getOneGassmaGroupByKeyOfBaseReturn } from "../../../generate/typeGenerate/gassmaGroupByKeyOfBaseReturn/oneGassmaGroupByKeyOfBaseReturn";

describe("getOneGassmaGroupByKeyOfBaseReturn", () => {
  it("should emit keyof GroupByBaseReturn alias", () => {
    const result = getOneGassmaGroupByKeyOfBaseReturn("", "User");
    expect(result).toContain(
      "export type GassmaUserGroupByKeyOfBaseReturn = keyof GassmaUserGroupByBaseReturn;",
    );
  });

  it("should prepend schemaName", () => {
    const result = getOneGassmaGroupByKeyOfBaseReturn("Test", "User");
    expect(result).toContain(
      "export type GassmaTestUserGroupByKeyOfBaseReturn = keyof GassmaTestUserGroupByBaseReturn;",
    );
  });
});
