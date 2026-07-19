import { describe, expect, it } from "vitest";
import { getOneGassmaController } from "../../../generate/typeGenerate/gassmaController/oneGassmaController";

describe("getOneGassmaController", () => {
  const result = getOneGassmaController("", "User");
  const res = `Gassma.WithComputed<GassmaUserFindResult<Gassma.StripComputed<T["select"], C>, T["include"], T["omit"], GO, O>, C, T["select"], T["omit"]>`;

  it("should generate controller class declaration with GO, O and computed map C", () => {
    expect(result).toContain(
      "export declare class GassmaUserController<GO extends GassmaUserOmit = {}, O = {}, C = {}>",
    );
  });

  it("should include constructor", () => {
    expect(result).toContain("constructor(sheetName: string, id?: string)");
  });

  it("should include changeSettings method", () => {
    expect(result).toContain("changeSettings(");
  });

  it("should include CRUD methods", () => {
    expect(result).toContain("createMany(");
    expect(result).toContain(
      "create<T extends GassmaUserCreateData & Gassma.ComputedArgs<C>>",
    );
    expect(result).toContain(
      "findFirst<T extends GassmaUserFindFirstData & Gassma.ComputedArgs<C>>",
    );
    expect(result).toContain(
      "findMany<T extends GassmaUserFindManyData & Gassma.ComputedArgs<C>>",
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
      `delete<T extends GassmaUserDeleteSingleData & Gassma.ComputedArgs<C>>(deleteData: T): ${res} | null`,
    );
  });

  it("should have generic upsert method with model-specific type", () => {
    expect(result).toContain(
      `upsert<T extends GassmaUserUpsertSingleData & Gassma.ComputedArgs<C>>(upsertData: T): ${res}`,
    );
  });

  it("should include createManyAndReturn method with generic type", () => {
    expect(result).toContain(
      `createManyAndReturn<T extends GassmaUserCreateManyAndReturnData & Gassma.ComputedArgs<C>>(createdData: T): ${res}[]`,
    );
  });

  it("should include updateManyAndReturn method with globalOmit and computed applied", () => {
    expect(result).toContain(
      "updateManyAndReturn(updateData: GassmaUserUpdateData): Gassma.WithComputed<GassmaUserFindResult<undefined, undefined, undefined, GO, O>, C, undefined, undefined>[]",
    );
  });

  it("should use FindFirstData for findFirst", () => {
    expect(result).toContain(
      `findFirst<T extends GassmaUserFindFirstData & Gassma.ComputedArgs<C>>(findData: T): ${res} | null`,
    );
  });

  it("should use FindFirstData for findFirstOrThrow", () => {
    expect(result).toContain(
      `findFirstOrThrow<T extends GassmaUserFindFirstData & Gassma.ComputedArgs<C>>(findData: T): ${res}`,
    );
  });

  it("should have generic create method with FindResult return", () => {
    expect(result).toContain(
      `create<T extends GassmaUserCreateData & Gassma.ComputedArgs<C>>(createdData: T): ${res}`,
    );
  });

  it("should have generic update method with model-specific type", () => {
    expect(result).toContain(
      `update<T extends GassmaUserUpdateSingleData & Gassma.ComputedArgs<C>>(updateData: T): ${res} | null`,
    );
  });

  it("should not wrap aggregate-family returns with computed fields", () => {
    expect(result).toContain(
      "aggregate<T extends GassmaUserAggregateData>(aggregateData: T): GassmaUserAggregateResult<T>",
    );
    expect(result).toContain("count(coutData: GassmaUserCountData): number");
    expect(result).toContain(
      "groupBy<T extends GassmaUserGroupByData>(groupByData: T): GassmaUserGroupByResult<T>[]",
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
