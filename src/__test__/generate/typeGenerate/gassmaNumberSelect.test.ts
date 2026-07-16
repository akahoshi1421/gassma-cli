import { describe, it, expect } from "vitest";
import { getOneGassmaNumberSelect } from "../../../generate/typeGenerate/gassmaSelect/oneGassmaNumberSelect";

describe("getOneGassmaNumberSelect", () => {
  it("should include only columns whose type contains number", () => {
    const result = getOneGassmaNumberSelect(
      { id: ["number"], email: ["string"], createdAt: ["Date"] },
      "",
      "User",
    );
    expect(result).toContain("export type GassmaUserNumberSelect = {");
    expect(result).toContain('"id"?: true;');
    expect(result).not.toContain('"email"');
    expect(result).not.toContain('"createdAt"');
  });

  it("should include addType union columns that contain number", () => {
    const result = getOneGassmaNumberSelect(
      {
        rating: ["number", "string", "boolean"],
        content: ["string", "number"],
      },
      "",
      "User",
    );
    expect(result).toContain('"rating"?: true;');
    expect(result).toContain('"content"?: true;');
  });

  it("should exclude {{number}} literal (replaceType) columns", () => {
    const result = getOneGassmaNumberSelect(
      { size: ["{{number}}"] },
      "",
      "User",
    );
    expect(result).not.toContain('"size"');
  });

  it("should strip trailing ? from column names", () => {
    const result = getOneGassmaNumberSelect({ "age?": ["number"] }, "", "User");
    expect(result).toContain('"age"?: true;');
    expect(result).not.toContain('"age?"');
  });

  it("should emit Record<string, never> when no numeric columns", () => {
    const result = getOneGassmaNumberSelect({ name: ["string"] }, "", "Tag");
    expect(result).toContain(
      "export type GassmaTagNumberSelect = Record<string, never>;",
    );
  });

  it("should prepend schemaName", () => {
    const result = getOneGassmaNumberSelect({ id: ["number"] }, "Test", "User");
    expect(result).toContain("export type GassmaTestUserNumberSelect");
  });
});
