import { describe, expect, it } from "vitest";
import { getOneGassmaController } from "../../../generate/typeGenerate/gassmaController/oneGassmaController";

describe("getOneGassmaController", () => {
  const result = getOneGassmaController("", "User", ["id"]);
  const res = `GassmaUserFindResult<T["select"], T["include"], T["omit"], GO, O, CMap>`;
  const sub = (dataType: string) => `T & Gassma.Subset<T, ${dataType}>`;
  const subExclusive = (dataType: string) =>
    `${sub(dataType)} & Gassma.IncludeSelectCheck<T>`;
  const withComputed = (dataType: string) =>
    `${dataType} & Gassma.ComputedArgs<Gassma.At<CMap, "User">>`;

  it("should generate controller class declaration with GO, O and computed map CMap", () => {
    expect(result).toContain(
      "export declare class GassmaUserController<GO extends GassmaUserOmit = {}, O = {}, CMap = {}>",
    );
  });

  it("should include constructor", () => {
    expect(result).toContain("constructor(sheetName: string, id?: string)");
  });

  it("should include changeSettings method accepting column letters", () => {
    expect(result).toContain(
      `changeSettings(
    startRowNumber: number,
    startColumnValue: number | string,
    endColumnValue: number | string
  ): void;`,
    );
  });

  it("should include CRUD methods", () => {
    expect(result).toContain("createMany(");
    expect(result).toContain(
      `create<T extends GassmaUserCreateData & Gassma.ComputedArgs<Gassma.At<CMap, "User">>>`,
    );
    expect(result).toContain(
      `findFirst<T extends GassmaUserFindFirstData & Gassma.ComputedArgs<Gassma.At<CMap, "User">>>`,
    );
    expect(result).toContain(
      `findMany<T extends GassmaUserFindManyData & Gassma.ComputedArgs<Gassma.At<CMap, "User">>>`,
    );
    expect(result).toContain("updateMany(");
    expect(result).not.toContain("upsertMany(");
    expect(result).toContain("deleteMany(");
  });

  it("should include fields property", () => {
    expect(result).toContain(
      "readonly fields: Record<string, Gassma.FieldRef>",
    );
  });

  it("should have generic delete method with model-specific type", () => {
    expect(result).toContain(
      `delete<T extends ${withComputed("GassmaUserDeleteSingleData")}>(deleteData: ${subExclusive(withComputed("GassmaUserDeleteSingleData"))}): ${res} | null`,
    );
  });

  it("should have generic upsert method with model-specific type", () => {
    expect(result).toContain(
      `upsert<T extends ${withComputed("GassmaUserUpsertSingleData")}>(upsertData: ${subExclusive(withComputed("GassmaUserUpsertSingleData"))}): ${res}`,
    );
  });

  it("should include createManyAndReturn method with generic type", () => {
    expect(result).toContain(
      `createManyAndReturn<T extends ${withComputed("GassmaUserCreateManyAndReturnData")}>(createdData: ${subExclusive(withComputed("GassmaUserCreateManyAndReturnData"))}): ${res}[]`,
    );
  });

  it("should include updateManyAndReturn method with generic type", () => {
    expect(result).toContain(
      `updateManyAndReturn<T extends ${withComputed("GassmaUserUpdateManyAndReturnData")}>(updateData: ${subExclusive(withComputed("GassmaUserUpdateManyAndReturnData"))}): ${res}[]`,
    );
  });

  it("should use FindFirstData for findFirst", () => {
    expect(result).toContain(
      `findFirst<T extends ${withComputed("GassmaUserFindFirstData")}>(findData: ${subExclusive(withComputed("GassmaUserFindFirstData"))}): ${res} | null`,
    );
  });

  it("should use FindFirstData for findFirstOrThrow", () => {
    expect(result).toContain(
      `findFirstOrThrow<T extends ${withComputed("GassmaUserFindFirstData")}>(findData: ${subExclusive(withComputed("GassmaUserFindFirstData"))}): ${res}`,
    );
  });

  it("should have generic create method with FindResult return", () => {
    expect(result).toContain(
      `create<T extends ${withComputed("GassmaUserCreateData")}>(createdData: ${subExclusive(withComputed("GassmaUserCreateData"))}): ${res}`,
    );
  });

  it("should have generic update method with model-specific type", () => {
    expect(result).toContain(
      `update<T extends ${withComputed("GassmaUserUpdateSingleData")}>(updateData: ${subExclusive(withComputed("GassmaUserUpdateSingleData"))}): ${res} | null`,
    );
  });

  it("should guard every select/include-taking operation against the conflict", () => {
    const guarded = [
      ["createManyAndReturn", "GassmaUserCreateManyAndReturnData"],
      ["create", "GassmaUserCreateData"],
      ["findFirst", "GassmaUserFindFirstData"],
      ["findFirstOrThrow", "GassmaUserFindFirstData"],
      ["findMany", "GassmaUserFindManyData"],
      ["update", "GassmaUserUpdateSingleData"],
      ["updateManyAndReturn", "GassmaUserUpdateManyAndReturnData"],
      ["upsert", "GassmaUserUpsertSingleData"],
      ["delete", "GassmaUserDeleteSingleData"],
    ];

    guarded.forEach(([method, dataType]) => {
      expect(result).toContain(
        `${method}<T extends ${withComputed(dataType)}>(`,
      );
      expect(result).toContain(subExclusive(withComputed(dataType)));
    });
  });

  it("should not guard operations that never take both select and include", () => {
    expect(result).toContain(
      `aggregate<T extends GassmaUserAggregateData>(aggregateData: ${sub("GassmaUserAggregateData")}):`,
    );
    expect(result).toContain(
      `count<T extends GassmaUserCountData>(countData: ${sub("GassmaUserCountData")}):`,
    );
    expect(result).not.toContain(
      "GassmaUserGroupByData> & Gassma.IncludeSelectCheck<T>",
    );
  });

  it("should not wrap aggregate-family returns with computed fields", () => {
    expect(result).toContain(
      `aggregate<T extends GassmaUserAggregateData>(aggregateData: ${sub("GassmaUserAggregateData")}): GassmaUserAggregateResult<T>`,
    );
    expect(result).toContain(
      `count<T extends GassmaUserCountData>(countData: ${sub("GassmaUserCountData")}): GassmaUserCountResult<T>`,
    );
    expect(result).toContain(
      `groupBy<T extends GassmaUserGroupByData>(groupByData: ${sub("GassmaUserGroupByData")} & Gassma.GroupByPaginationCheck<T, GassmaUserGroupByData> & Gassma.GroupByOrderByFieldCheck<T>): GassmaUserGroupByResult<T>[]`,
    );
    expect(result).toContain(
      "createMany(createdData: GassmaUserCreateManyData): CreateManyReturn",
    );
  });

  it("should include aggregation methods", () => {
    expect(result).toContain("aggregate<T extends GassmaUserAggregateData>");
    expect(result).toContain("count(");
    expect(result).toContain("groupBy<T extends GassmaUserGroupByData>");
  });
});
