import { describe, it, expect } from "vitest";
import { getOneGassmaSelect } from "../../../generate/typeGenerate/gassmaSelect/oneGassmaSelect";

describe("getOneGassmaSelect", () => {
  it("should emit Select with each column as optional true", () => {
    const result = getOneGassmaSelect({ id: [1], name: ["a"] }, "", "User");
    expect(result).toContain("export type GassmaUserSelect = {");
    expect(result).toContain('"id"?: true;');
    expect(result).toContain('"name"?: true;');
  });

  it("should strip trailing ? from column names", () => {
    const result = getOneGassmaSelect({ "name?": ["a"] }, "", "User");
    expect(result).toContain('"name"?: true;');
    expect(result).not.toContain('"name?"');
  });

  it("should emit empty body when no columns", () => {
    const result = getOneGassmaSelect({}, "", "User");
    expect(result).toContain("export type GassmaUserSelect = {");
    expect(result).toContain("};");
  });

  it("should prepend schemaName", () => {
    const result = getOneGassmaSelect({ id: [1] }, "Test", "User");
    expect(result).toContain("export type GassmaTestUserSelect");
  });
});
