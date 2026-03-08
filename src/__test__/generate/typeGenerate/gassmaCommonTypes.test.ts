import { getGassmaCommonTypes } from "../../../generate/typeGenerate/gassmaCommonTypes";

describe("getGassmaCommonTypes", () => {
  const result = getGassmaCommonTypes();

  it("should generate RelationsConfig type", () => {
    expect(result).toContain("type RelationsConfig =");
  });

  it("should generate IncludeData type", () => {
    expect(result).toContain("type IncludeData =");
  });

  it("should generate CountValue related types", () => {
    expect(result).toContain("type CountSelectItem =");
    expect(result).toContain("type CountSelect =");
    expect(result).toContain("type CountValue =");
  });

  it("should generate NumberOperation type", () => {
    expect(result).toContain("type NumberOperation =");
    expect(result).toContain("increment?: number");
    expect(result).toContain("decrement?: number");
    expect(result).toContain("multiply?: number");
    expect(result).toContain("divide?: number");
  });

  it("should generate NestedWriteOperation type", () => {
    expect(result).toContain("type NestedWriteOperation =");
    expect(result).toContain("create?: unknown");
    expect(result).toContain("connect?: unknown");
    expect(result).toContain("connectOrCreate?: unknown");
    expect(result).toContain("disconnect?: unknown");
    expect(result).toContain("set?: unknown");
  });

  it("should generate SortOrderInput type", () => {
    expect(result).toContain("type SortOrderInput =");
    expect(result).toContain('sort: "asc" | "desc"');
    expect(result).toContain('nulls?: "first" | "last"');
  });

  it("should generate RelationOrderBy type", () => {
    expect(result).toContain("type RelationOrderBy =");
  });

  it("should generate RelationListFilter type", () => {
    expect(result).toContain("type RelationListFilter =");
    expect(result).toContain("some?:");
    expect(result).toContain("every?:");
    expect(result).toContain("none?:");
  });

  it("should generate RelationSingleFilter type", () => {
    expect(result).toContain("type RelationSingleFilter =");
    expect(result).toContain("is?:");
    expect(result).toContain("isNot?:");
  });

  it("should generate ManyReturn types", () => {
    expect(result).toContain("type ManyReturn =");
    expect(result).toContain("count: number");
    expect(result).toContain("type CreateManyReturn = ManyReturn");
    expect(result).toContain("type UpdateManyReturn = ManyReturn");
    expect(result).toContain("type DeleteManyReturn = ManyReturn");
    expect(result).toContain("type UpsertManyReturn = ManyReturn");
  });
});
