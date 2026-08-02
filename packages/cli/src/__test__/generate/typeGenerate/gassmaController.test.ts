import { describe, expect, it } from "vitest";
import { getOneGassmaController } from "../../../generate/typeGenerate/gassmaController/oneGassmaController";

describe("getOneGassmaController", () => {
  const result = getOneGassmaController("", "User");
  const res = `GassmaUserFindResult<T["select"], T["include"], T["omit"], GO, O, CMap>`;
  const sub = (dataType: string) => `Gassma.Subset<T, ${dataType}>`;
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
      `delete<T extends ${withComputed("GassmaUserDeleteSingleData")}>(deleteData: ${sub(withComputed("GassmaUserDeleteSingleData"))}): ${res} | null`,
    );
  });

  it("should have generic upsert method with model-specific type", () => {
    expect(result).toContain(
      `upsert<T extends ${withComputed("GassmaUserUpsertSingleData")}>(upsertData: ${sub(withComputed("GassmaUserUpsertSingleData"))}): ${res}`,
    );
  });

  it("should include createManyAndReturn method with generic type", () => {
    expect(result).toContain(
      `createManyAndReturn<T extends ${withComputed("GassmaUserCreateManyAndReturnData")}>(createdData: ${sub(withComputed("GassmaUserCreateManyAndReturnData"))}): ${res}[]`,
    );
  });

  it("should include updateManyAndReturn method with globalOmit and computed applied", () => {
    expect(result).toContain(
      "updateManyAndReturn(updateData: GassmaUserUpdateData): GassmaUserFindResult<undefined, undefined, undefined, GO, O, CMap>[]",
    );
  });

  it("should use FindFirstData for findFirst", () => {
    expect(result).toContain(
      `findFirst<T extends ${withComputed("GassmaUserFindFirstData")}>(findData: ${sub(withComputed("GassmaUserFindFirstData"))}): ${res} | null`,
    );
  });

  it("should use FindFirstData for findFirstOrThrow", () => {
    expect(result).toContain(
      `findFirstOrThrow<T extends ${withComputed("GassmaUserFindFirstData")}>(findData: ${sub(withComputed("GassmaUserFindFirstData"))}): ${res}`,
    );
  });

  it("should have generic create method with FindResult return", () => {
    expect(result).toContain(
      `create<T extends ${withComputed("GassmaUserCreateData")}>(createdData: ${sub(withComputed("GassmaUserCreateData"))}): ${res}`,
    );
  });

  it("should have generic update method with model-specific type", () => {
    expect(result).toContain(
      `update<T extends ${withComputed("GassmaUserUpdateSingleData")}>(updateData: ${sub(withComputed("GassmaUserUpdateSingleData"))}): ${res} | null`,
    );
  });

  it("should not wrap aggregate-family returns with computed fields", () => {
    expect(result).toContain(
      `aggregate<T extends GassmaUserAggregateData>(aggregateData: ${sub("GassmaUserAggregateData")}): GassmaUserAggregateResult<T>`,
    );
    expect(result).toContain("count(coutData: GassmaUserCountData): number");
    expect(result).toContain(
      `groupBy<T extends GassmaUserGroupByData>(groupByData: ${sub("GassmaUserGroupByData")}): GassmaUserGroupByResult<T>[]`,
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
