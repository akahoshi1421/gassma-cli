import { getOneGassmaController } from "../../../generate/typeGenerate/gassmaController/oneGassmaController";

describe("getOneGassmaController", () => {
  const result = getOneGassmaController("User");

  it("should generate controller class declaration", () => {
    expect(result).toContain("declare class GassmaUserController");
  });

  it("should include constructor", () => {
    expect(result).toContain("constructor(sheetName: string, id?: string)");
  });

  it("should include changeSettings method", () => {
    expect(result).toContain("changeSettings(");
  });

  it("should include CRUD methods", () => {
    expect(result).toContain("createMany(");
    expect(result).toContain("create(");
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

  it("should include delete method", () => {
    expect(result).toContain(
      "delete(deleteData: Gassma.DeleteSingleData): Record<string, unknown> | null",
    );
  });

  it("should include upsert method", () => {
    expect(result).toContain(
      "upsert(upsertData: Gassma.UpsertSingleData): Record<string, unknown>",
    );
  });

  it("should include createManyAndReturn method", () => {
    expect(result).toContain(
      "createManyAndReturn(createdData: GassmaUserCreateManyData): Record<string, unknown>[]",
    );
  });

  it("should include updateManyAndReturn method", () => {
    expect(result).toContain(
      "updateManyAndReturn(updateData: GassmaUserUpdateData): Record<string, unknown>[]",
    );
  });

  it("should include findFirstOrThrow method", () => {
    expect(result).toContain("findFirstOrThrow<T extends GassmaUserFindData>");
  });

  it("should include aggregation methods", () => {
    expect(result).toContain("aggregate<T extends GassmaUserAggregateData>");
    expect(result).toContain("count(");
    expect(result).toContain("groupBy<T extends GassmaUserGroupByData>");
  });
});
