import { generater } from "../../generate/generator";

describe("generater", () => {
  const dictYaml: Record<string, Record<string, unknown[]>> = {
    User: {
      "id?": ["number"],
      name: ["string"],
      "email?": ["string"],
    },
    Post: {
      "id?": ["number"],
      title: ["string"],
      content: ["string"],
    },
  };

  const result = generater(dictYaml);

  it("GassmaClient namespace を含む", () => {
    expect(result).toContain("declare namespace Gassma");
  });

  it("GassmaSheet 型を含む", () => {
    expect(result).toContain("declare type GassmaSheet = {");
    expect(result).toContain('"User": GassmaUserController;');
    expect(result).toContain('"Post": GassmaPostController;');
  });

  it("各シートの Controller を含む", () => {
    expect(result).toContain("declare class GassmaUserController");
    expect(result).toContain("declare class GassmaPostController");
  });

  it("各シートの Use 型を含む", () => {
    expect(result).toContain("declare type GassmaUserUse = {");
    expect(result).toContain("declare type GassmaPostUse = {");
  });

  it("FilterConditions 型を含む", () => {
    expect(result).toContain("GassmaUseridFilterConditions");
    expect(result).toContain("GassmaPostidFilterConditions");
  });

  it("WhereUse 型を含む", () => {
    expect(result).toContain("GassmaUserWhereUse");
    expect(result).toContain("GassmaPostWhereUse");
  });

  it("FindData 型を含む", () => {
    expect(result).toContain("GassmaUserFindData");
    expect(result).toContain("GassmaPostFindData");
  });

  it("CreateData 型を含む", () => {
    expect(result).toContain("GassmaUserCreateData");
    expect(result).toContain("GassmaPostCreateData");
  });

  it("UpdateData 型を含む", () => {
    expect(result).toContain("GassmaUserUpdateData");
    expect(result).toContain("GassmaPostUpdateData");
  });

  it("Select 型を含む", () => {
    expect(result).toContain("GassmaUserSelect");
    expect(result).toContain("GassmaPostSelect");
  });

  it("Omit 型を含む", () => {
    expect(result).toContain("GassmaUserOmit");
    expect(result).toContain("GassmaPostOmit");
  });

  it("OrderBy 型を含む", () => {
    expect(result).toContain("GassmaUserOrderBy");
    expect(result).toContain("GassmaPostOrderBy");
  });

  it("Aggregate 系型を含む", () => {
    expect(result).toContain("GassmaUserAggregateData");
    expect(result).toContain("GassmaUserAggregateResult");
  });

  it("GroupBy 系型を含む", () => {
    expect(result).toContain("GassmaUserGroupByData");
    expect(result).toContain("GassmaUserGroupByResult");
  });
});
