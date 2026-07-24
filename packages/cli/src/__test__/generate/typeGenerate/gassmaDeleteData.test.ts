import { describe, it, expect } from "vitest";
import { getGassmaDeleteData } from "../../../generate/typeGenerate/gassmaDeleteData";

describe("getGassmaDeleteData", () => {
  it("should emit DeleteData for each given sheet", () => {
    const result = getGassmaDeleteData(["User", "Post"], "");
    expect(result).toContain("GassmaUserDeleteData");
    expect(result).toContain("GassmaPostDeleteData");
  });

  it("should prepend schemaName", () => {
    const result = getGassmaDeleteData(["User"], "Test");
    expect(result).toContain("GassmaTestUserDeleteData");
  });

  it("should produce empty string for empty sheet list", () => {
    expect(getGassmaDeleteData([], "")).toBe("");
  });

  it("should make where optional (deleteMany without where targets all rows)", () => {
    const result = getGassmaDeleteData(["User"], "");
    expect(result).toContain("where?: GassmaUserWhereUse;");
  });
});
