import { describe, it, expect } from "vitest";
import { getOneGassmaHavingCore } from "../../../generate/typeGenerate/gassmaHavingCore/oneGassmaHavingCore";

describe("getOneGassmaHavingCore", () => {
  it("should emit a HavingCore type per column", () => {
    const result = getOneGassmaHavingCore(
      { id: ["number"], name: ["string"] },
      "",
      "User",
    );
    expect(result).toContain("export type GassmaUseridHavingCore");
    expect(result).toContain("export type GassmaUsernameHavingCore");
    expect(result).toContain("HavingCore = {");
  });

  it("should include _avg / _count / _sum for number columns", () => {
    const result = getOneGassmaHavingCore({ id: ["number"] }, "", "User");
    expect(result).toContain("_avg?: Gassma.FilterConditions<number>;");
    expect(result).toContain("_count?: Gassma.FilterConditions<number>;");
    expect(result).toContain("_sum?: Gassma.FilterConditions<number>;");
    expect(result).toContain("} & GassmaUseridFilterConditions;");
  });

  it("should omit _avg / _sum for non-number columns", () => {
    const result = getOneGassmaHavingCore({ name: ["string"] }, "", "User");
    expect(result).not.toContain("_avg?:");
    expect(result).not.toContain("_sum?:");
    expect(result).toContain("_count?: Gassma.FilterConditions<number>;");
    expect(result).toContain("_max?: GassmaUsernameFilterConditions;");
    expect(result).toContain("_min?: GassmaUsernameFilterConditions;");
    expect(result).toContain("} & GassmaUsernameFilterConditions;");
  });

  it("should include _avg / _sum for addType union columns containing number", () => {
    const result = getOneGassmaHavingCore(
      { rating: ["number", "string", "boolean"] },
      "",
      "User",
    );
    expect(result).toContain("_avg?: Gassma.FilterConditions<number>;");
    expect(result).toContain("_sum?: Gassma.FilterConditions<number>;");
  });

  it("should omit _avg / _sum for {{number}} literal (replaceType) columns", () => {
    const result = getOneGassmaHavingCore({ size: ["{{number}}"] }, "", "User");
    expect(result).not.toContain("_avg?:");
    expect(result).not.toContain("_sum?:");
  });

  it("should decide _avg / _sum per column in a mixed sheet", () => {
    const result = getOneGassmaHavingCore(
      { id: ["number"], name: ["string"] },
      "",
      "User",
    );
    const blocks = result.split("export type ");
    const idBlock = blocks.find((block) =>
      block.startsWith("GassmaUseridHavingCore"),
    );
    const nameBlock = blocks.find((block) =>
      block.startsWith("GassmaUsernameHavingCore"),
    );
    expect(idBlock).toContain("_avg?:");
    expect(idBlock).toContain("_sum?:");
    expect(nameBlock).not.toContain("_avg?:");
    expect(nameBlock).not.toContain("_sum?:");
  });

  it("should keep field FilterConditions for _min / _max", () => {
    const result = getOneGassmaHavingCore({ name: ["string"] }, "", "User");
    expect(result).toContain("_max?: GassmaUsernameFilterConditions;");
    expect(result).toContain("_min?: GassmaUsernameFilterConditions;");
    expect(result).not.toContain("_max?: Gassma.FilterConditions<number>;");
    expect(result).not.toContain("_min?: Gassma.FilterConditions<number>;");
  });

  it("should prepend schemaName", () => {
    const result = getOneGassmaHavingCore({ id: ["number"] }, "Test", "User");
    expect(result).toContain("GassmaTestUseridHavingCore");
  });

  it("should produce empty string when no columns", () => {
    expect(getOneGassmaHavingCore({}, "", "User")).toBe("");
  });
});
