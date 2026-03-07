import { getOneGassmaController } from "../../../generate/typeGenerate/gassmaController/oneGassmaController";

describe("getOneGassmaController", () => {
  const result = getOneGassmaController("User");

  it("コントローラクラス宣言を生成する", () => {
    expect(result).toContain("declare class GassmaUserController");
  });

  it("constructorを含む", () => {
    expect(result).toContain("constructor(sheetName: string, id?: string)");
  });

  it("changeSettingsメソッドを含む", () => {
    expect(result).toContain("changeSettings(");
  });

  it("CRUDメソッドを含む", () => {
    expect(result).toContain("createMany(");
    expect(result).toContain("create(");
    expect(result).toContain("findFirst<T extends GassmaUserFindData>");
    expect(result).toContain("findMany<T extends GassmaUserFindManyData>");
    expect(result).toContain("updateMany(");
    expect(result).toContain("upsertMany(");
    expect(result).toContain("deleteMany(");
  });

  it("集計メソッドを含む", () => {
    expect(result).toContain("aggregate<T extends GassmaUserAggregateData>");
    expect(result).toContain("count(");
    expect(result).toContain("groupBy<T extends GassmaUserGroupByData>");
  });
});
