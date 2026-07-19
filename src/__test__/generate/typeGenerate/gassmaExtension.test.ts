import { describe, expect, it } from "vitest";
import { getGassmaExtension } from "../../../generate/typeGenerate/gassmaExtension";

describe("getGassmaExtension", () => {
  const result = getGassmaExtension(["User", "Post"], "Hoge");

  it("should generate Extension type with optional query", () => {
    expect(result).toContain(
      "export type GassmaHogeExtension<O extends GassmaHogeGlobalOmitConfig = {}> = {",
    );
    expect(result).toContain("  query?: GassmaHogeQueryExtension<O>;");
  });

  it("should generate QueryExtension with per-model hooks and $allModels", () => {
    expect(result).toContain(
      "export type GassmaHogeQueryExtension<O extends GassmaHogeGlobalOmitConfig = {}> = {",
    );
    expect(result).toContain(
      '  "User"?: GassmaHogeUserQueryHooks<O extends { "User": infer UO } ? UO extends GassmaHogeUserOmit ? UO : {} : {}, O>;',
    );
    expect(result).toContain(
      '  "Post"?: GassmaHogePostQueryHooks<O extends { "Post": infer UO } ? UO extends GassmaHogePostOmit ? UO : {} : {}, O>;',
    );
    expect(result).toContain("  $allModels?: GassmaHogeAllModelsQueryHooks;");
  });

  it("should generate ModelName and OperationName unions", () => {
    expect(result).toContain("export type GassmaHogeModelName =");
    expect(result).toContain('  | "User"');
    expect(result).toContain('  | "Post"');
    expect(result).toContain("export type GassmaHogeOperationName =");
    const operations = [
      "findFirst",
      "findFirstOrThrow",
      "findMany",
      "create",
      "createMany",
      "createManyAndReturn",
      "update",
      "updateMany",
      "updateManyAndReturn",
      "upsert",
      "delete",
      "deleteMany",
      "count",
      "aggregate",
      "groupBy",
    ];
    operations.forEach((operation) => {
      expect(result).toContain(`  | "${operation}"`);
    });
  });

  it("should generate QueryHooks with generic hooks bound to model data types", () => {
    expect(result).toContain(
      "export type GassmaHogeUserQueryHooks<GO extends GassmaHogeUserOmit = {}, O = {}> = {",
    );
    expect(result).toContain(
      "  findMany?: <T extends GassmaHogeUserFindManyData>(params: {",
    );
    expect(result).toContain(
      '    query: (args: T) => GassmaHogeUserFindResult<T["select"], T["include"], T["omit"], GO, O>[];',
    );
    expect(result).toContain(
      '  }) => GassmaHogeUserFindResult<T["select"], T["include"], T["omit"], GO, O>[];',
    );
    expect(result).toContain(
      "  findFirst?: <T extends GassmaHogeUserFindFirstData>(params: {",
    );
    expect(result).toContain(
      '  }) => GassmaHogeUserFindResult<T["select"], T["include"], T["omit"], GO, O> | null;',
    );
    expect(result).toContain(
      "  findFirstOrThrow?: <T extends GassmaHogeUserFindFirstData>(params: {",
    );
    expect(result).toContain(
      "  create?: <T extends GassmaHogeUserCreateData>(params: {",
    );
    expect(result).toContain(
      "  createManyAndReturn?: <T extends GassmaHogeUserCreateManyAndReturnData>(params: {",
    );
    expect(result).toContain(
      "  update?: <T extends GassmaHogeUserUpdateSingleData>(params: {",
    );
    expect(result).toContain(
      "  upsert?: <T extends GassmaHogeUserUpsertSingleData>(params: {",
    );
    expect(result).toContain(
      "  delete?: <T extends GassmaHogeUserDeleteSingleData>(params: {",
    );
    expect(result).toContain(
      "  aggregate?: <T extends GassmaHogeUserAggregateData>(params: {",
    );
    expect(result).toContain("  }) => GassmaHogeUserAggregateResult<T>;");
    expect(result).toContain(
      "  groupBy?: <T extends GassmaHogeUserGroupByData>(params: {",
    );
    expect(result).toContain("  }) => GassmaHogeUserGroupByResult<T>[];");
  });

  it("should generate non-generic hooks with fixed args and results", () => {
    expect(result).toContain("  createMany?: (params: {");
    expect(result).toContain("    args: GassmaHogeUserCreateManyData;");
    expect(result).toContain(
      "    query: (args: GassmaHogeUserCreateManyData) => CreateManyReturn;",
    );
    expect(result).toContain("  }) => CreateManyReturn;");
    expect(result).toContain("  updateMany?: (params: {");
    expect(result).toContain(
      "    query: (args: GassmaHogeUserUpdateData) => UpdateManyReturn;",
    );
    expect(result).toContain("  updateManyAndReturn?: (params: {");
    expect(result).toContain(
      "    query: (args: GassmaHogeUserUpdateData) => GassmaHogeUserFindResult<undefined, undefined, undefined, GO, O>[];",
    );
    expect(result).toContain("  deleteMany?: (params: {");
    expect(result).toContain(
      "    query: (args: GassmaHogeUserDeleteData) => DeleteManyReturn;",
    );
    expect(result).toContain("  count?: (params: {");
    expect(result).toContain(
      "    query: (args: GassmaHogeUserCountData) => number;",
    );
  });

  it("should bind model and operation literals in hook params", () => {
    expect(result).toContain('    model: "User";');
    expect(result).toContain('    model: "Post";');
    expect(result).toContain('    operation: "findMany";');
    expect(result).toContain('    operation: "groupBy";');
  });

  it("should generate per-model QueryArgs union and model-level $allOperations", () => {
    expect(result).toContain("export type GassmaHogeUserQueryArgs =");
    expect(result).toContain("  | GassmaHogeUserFindFirstData");
    expect(result).toContain("  | GassmaHogeUserFindManyData");
    expect(result).toContain("  | GassmaHogeUserGroupByData;");
    expect(result).toContain("  $allOperations?: (params: {");
    expect(result).toContain("    operation: GassmaHogeOperationName;");
    expect(result).toContain("    args: GassmaHogeUserQueryArgs;");
    expect(result).toContain(
      "    query: (args: GassmaHogeUserQueryArgs) => unknown;",
    );
  });

  it("should generate $allModels hooks with model unions", () => {
    expect(result).toContain("export type GassmaHogeAllModelsQueryHooks = {");
    expect(result).toContain("    model: GassmaHogeModelName;");
    expect(result).toContain(
      "    args: GassmaHogeUserFindManyData | GassmaHogePostFindManyData;",
    );
    expect(result).toContain(
      "    query: (args: GassmaHogeUserFindManyData | GassmaHogePostFindManyData) => unknown;",
    );
    expect(result).toContain("export type GassmaHogeQueryArgs =");
    expect(result).toContain("  | GassmaHogeUserQueryArgs");
    expect(result).toContain("  | GassmaHogePostQueryArgs;");
    expect(result).toContain("    args: GassmaHogeQueryArgs;");
  });

  it("should remove invalid chars from type names but keep raw sheet keys", () => {
    const spaced = getGassmaExtension(["My Sheet"], "");
    expect(spaced).toContain(
      '  "My Sheet"?: GassmaMySheetQueryHooks<O extends { "My Sheet": infer UO } ? UO extends GassmaMySheetOmit ? UO : {} : {}, O>;',
    );
    expect(spaced).toContain('    model: "My Sheet";');
    expect(spaced).toContain("export type GassmaMySheetQueryArgs =");
  });

  it("should work with empty schema name", () => {
    const plain = getGassmaExtension(["User"], "");
    expect(plain).toContain(
      "export type GassmaExtension<O extends GassmaGlobalOmitConfig = {}> = {",
    );
    expect(plain).toContain("  query?: GassmaQueryExtension<O>;");
    expect(plain).toContain(
      "export type GassmaUserQueryHooks<GO extends GassmaUserOmit = {}, O = {}> = {",
    );
  });
});
