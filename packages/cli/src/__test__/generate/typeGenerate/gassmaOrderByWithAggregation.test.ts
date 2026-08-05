import { describe, it, expect } from "vitest";
import { getGassmaOrderByWithAggregation } from "../../../generate/typeGenerate/gassmaOrderByWithAggregation";
import { getOneGassmaOrderByWithAggregation } from "../../../generate/typeGenerate/gassmaOrderByWithAggregation/oneGassmaOrderByWithAggregation";

describe("getOneGassmaOrderByWithAggregation", () => {
  const sheetContent = { id: ["number"], name: ["string"] };

  it("should declare a type per sheet", () => {
    const result = getOneGassmaOrderByWithAggregation(sheetContent, "", "User");
    expect(result).toContain(
      "export type GassmaUserOrderByWithAggregation = {",
    );
  });

  it("should allow every scalar column with SortOrderInput", () => {
    const result = getOneGassmaOrderByWithAggregation(sheetContent, "", "User");
    expect(result).toContain(
      '  "id"?: "asc" | "desc" | Gassma.SortOrderInput;\n',
    );
    expect(result).toContain(
      '  "name"?: "asc" | "desc" | Gassma.SortOrderInput;\n',
    );
  });

  it("should allow every column in _count / _max / _min", () => {
    const result = getOneGassmaOrderByWithAggregation(sheetContent, "", "User");
    expect(result).toContain(
      '  "_count"?: { "id"?: "asc" | "desc"; "name"?: "asc" | "desc" };\n',
    );
    expect(result).toContain(
      '  "_max"?: { "id"?: "asc" | "desc"; "name"?: "asc" | "desc" };\n',
    );
    expect(result).toContain(
      '  "_min"?: { "id"?: "asc" | "desc"; "name"?: "asc" | "desc" };\n',
    );
  });

  it("should limit _avg / _sum to number columns", () => {
    const result = getOneGassmaOrderByWithAggregation(sheetContent, "", "User");
    expect(result).toContain('  "_avg"?: { "id"?: "asc" | "desc" };\n');
    expect(result).toContain('  "_sum"?: { "id"?: "asc" | "desc" };\n');
  });

  it("should treat an addType column containing number as a number column", () => {
    const result = getOneGassmaOrderByWithAggregation(
      { rating: ["number", "string"] },
      "",
      "User",
    );
    expect(result).toContain('  "_avg"?: { "rating"?: "asc" | "desc" };\n');
  });

  it("should drop _avg / _sum when the sheet has no number column", () => {
    const result = getOneGassmaOrderByWithAggregation(
      { name: ["string"] },
      "",
      "User",
    );
    expect(result).not.toContain('"_avg"');
    expect(result).not.toContain('"_sum"');
    expect(result).toContain('  "_count"?: { "name"?: "asc" | "desc" };\n');
  });

  it("should not contain relation fields", () => {
    const result = getOneGassmaOrderByWithAggregation(sheetContent, "", "User");
    expect(result).not.toContain("posts");
  });

  it("should strip trailing ? from column names", () => {
    const result = getOneGassmaOrderByWithAggregation(
      { "name?": ["string"] },
      "",
      "User",
    );
    expect(result).toContain(
      '  "name"?: "asc" | "desc" | Gassma.SortOrderInput;\n',
    );
    expect(result).not.toContain('"name?"');
  });

  it("should prepend schemaName", () => {
    const result = getOneGassmaOrderByWithAggregation(
      sheetContent,
      "Test",
      "User",
    );
    expect(result).toContain(
      "export type GassmaTestUserOrderByWithAggregation = {",
    );
  });

  it("should add SkipValue to every optional property when strict", () => {
    const result = getOneGassmaOrderByWithAggregation(
      sheetContent,
      "",
      "User",
      true,
    );
    expect(result).toContain(
      '  "id"?: "asc" | "desc" | Gassma.SortOrderInput | Gassma.SkipValue;\n',
    );
    expect(result).toContain(
      '  "_count"?: { "id"?: "asc" | "desc" | Gassma.SkipValue; "name"?: "asc" | "desc" | Gassma.SkipValue } | Gassma.SkipValue;\n',
    );
    expect(result).toContain(
      '  "_avg"?: { "id"?: "asc" | "desc" | Gassma.SkipValue } | Gassma.SkipValue;\n',
    );
  });

  it("should keep non-strict output free of Skip", () => {
    const result = getOneGassmaOrderByWithAggregation(sheetContent, "", "User");
    expect(result).not.toContain("Skip");
  });
});

describe("getGassmaOrderByWithAggregation", () => {
  it("should declare a type for every sheet", () => {
    const result = getGassmaOrderByWithAggregation(
      { User: { id: ["number"] }, Post: { title: ["string"] } },
      "",
    );
    expect(result).toContain("export type GassmaUserOrderByWithAggregation");
    expect(result).toContain("export type GassmaPostOrderByWithAggregation");
  });

  it("should remove characters that cannot be used in a type name", () => {
    const result = getGassmaOrderByWithAggregation(
      { "メンバー 一覧": { id: ["number"] } },
      "",
    );
    expect(result).toContain(
      "export type Gassmaメンバー一覧OrderByWithAggregation",
    );
  });
});
