import { getOneGassmaController } from "../../../generate/typeGenerate/gassmaController/oneGassmaController";

describe("getOneGassmaController", () => {
  const result = getOneGassmaController("", "User");

  it("should generate controller class declaration", () => {
    expect(result).toContain(
      "declare class GassmaUserController<GO extends GassmaUserOmit = {}>",
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
    expect(result).toContain("create<T extends GassmaUserCreateData>");
    expect(result).toContain("findFirst<T extends GassmaUserFindData>");
    expect(result).toContain("findMany<T extends GassmaUserFindManyData>");
    expect(result).toContain("updateMany(");
    expect(result).toContain("upsertMany(");
    expect(result).toContain("deleteMany(");
  });

  it("should include fields property", () => {
    expect(result).toContain(
      "readonly fields: Record<string, Gassma.FieldRef>",
    );
  });

  it("should have generic delete method with model-specific type", () => {
    expect(result).toContain(
      'delete<T extends GassmaUserDeleteSingleData>(deleteData: T): GassmaUserFindResult<T["select"], T["omit"], GO> | null',
    );
  });

  it("should have generic upsert method with model-specific type", () => {
    expect(result).toContain(
      'upsert<T extends GassmaUserUpsertSingleData>(upsertData: T): GassmaUserFindResult<T["select"], T["omit"], GO>',
    );
  });

  it("should include createManyAndReturn method", () => {
    expect(result).toContain(
      "createManyAndReturn(createdData: GassmaUserCreateManyData): GassmaUserDefaultFindResult[]",
    );
  });

  it("should include updateManyAndReturn method", () => {
    expect(result).toContain(
      "updateManyAndReturn(updateData: GassmaUserUpdateData): GassmaUserDefaultFindResult[]",
    );
  });

  it("should include findFirstOrThrow method", () => {
    expect(result).toContain("findFirstOrThrow<T extends GassmaUserFindData>");
  });

  it("should have generic create method with FindResult return", () => {
    expect(result).toContain(
      'create<T extends GassmaUserCreateData>(createdData: T): GassmaUserFindResult<T["select"], T["omit"], GO>',
    );
  });

  it("should have generic update method with model-specific type", () => {
    expect(result).toContain(
      'update<T extends GassmaUserUpdateSingleData>(updateData: T): GassmaUserFindResult<T["select"], T["omit"], GO> | null',
    );
  });

  it("should include aggregation methods", () => {
    expect(result).toContain("aggregate<T extends GassmaUserAggregateData>");
    expect(result).toContain("count(");
    expect(result).toContain("groupBy<T extends GassmaUserGroupByData>");
  });
});
