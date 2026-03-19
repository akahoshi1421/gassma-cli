import { getGassmaCommonTypes } from "../../../generate/typeGenerate/gassmaCommonTypes";

describe("getGassmaCommonTypes", () => {
  const result = getGassmaCommonTypes();

  it("should generate RelationsConfig type", () => {
    expect(result).toContain("type RelationsConfig =");
  });

  it("should generate NumberOperation type", () => {
    expect(result).toContain("type NumberOperation =");
    expect(result).toContain("increment?: number");
    expect(result).toContain("decrement?: number");
    expect(result).toContain("multiply?: number");
    expect(result).toContain("divide?: number");
  });

  it("should generate SortOrderInput type", () => {
    expect(result).toContain("type SortOrderInput =");
    expect(result).toContain('sort: "asc" | "desc"');
    expect(result).toContain('nulls?: "first" | "last"');
  });

  it("should generate ManyReturn types", () => {
    expect(result).toContain("type ManyReturn =");
    expect(result).toContain("count: number");
    expect(result).toContain("type CreateManyReturn = ManyReturn");
    expect(result).toContain("type UpdateManyReturn = ManyReturn");
    expect(result).toContain("type DeleteManyReturn = ManyReturn");
    expect(result).not.toContain("type UpsertManyReturn = ManyReturn");
  });

  it("should not contain removed generic types", () => {
    expect(result).not.toContain("type IncludeData");
    expect(result).not.toContain("type CountSelectItem");
    expect(result).not.toContain("type CountValue");
    expect(result).not.toContain("type NestedWriteOperation");
    expect(result).not.toContain("type RelationOrderBy");
    expect(result).not.toContain("type RelationListFilter");
    expect(result).not.toContain("type RelationSingleFilter");
  });
});
