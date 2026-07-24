import { describe, it, expect } from "vitest";
import { getOneGassmaByField } from "../../../generate/typeGenerate/gassmaByField/oneGassmaByField";

describe("getOneGassmaByField", () => {
  it("should declare ByField with key-or-keys parameter", () => {
    const result = getOneGassmaByField("", "User");
    expect(result).toContain(
      "export type GassmaUserByField<T extends GassmaUserGroupByKeyOfBaseReturn | GassmaUserGroupByKeyOfBaseReturn[]>",
    );
  });

  it("should map array case to indexed lookup over GroupByBaseReturn", () => {
    const result = getOneGassmaByField("", "User");
    expect(result).toContain("T extends GassmaUserGroupByKeyOfBaseReturn[]");
    expect(result).toContain(
      "[K in T[number]]: GassmaUserGroupByBaseReturn[K & keyof GassmaUserGroupByBaseReturn]",
    );
  });

  it("should map single key case via keyof", () => {
    const result = getOneGassmaByField("", "User");
    expect(result).toContain("T extends keyof GassmaUserGroupByBaseReturn");
    expect(result).toContain("[K in T]: GassmaUserGroupByBaseReturn[K]");
  });

  it("should fall through to never for non-matching T", () => {
    const result = getOneGassmaByField("", "User");
    expect(result).toContain(": never;");
  });

  it("should prepend schemaName", () => {
    const result = getOneGassmaByField("Test", "User");
    expect(result).toContain("export type GassmaTestUserByField");
    expect(result).toContain("GassmaTestUserGroupByBaseReturn");
  });
});
