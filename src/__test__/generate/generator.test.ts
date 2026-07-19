import { describe, expect, it } from "vitest";
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

  it("should include GassmaClient namespace", () => {
    expect(result).toContain("export namespace Gassma");
  });

  it("should include GassmaSheet type", () => {
    expect(result).toContain(
      "export type GassmaSheet<O extends GassmaGlobalOmitConfig = {}> = {",
    );
    expect(result).toContain(
      '"User": GassmaUserController<O extends { "User": infer UO } ? UO extends GassmaUserOmit ? UO : {} : {}, O>;',
    );
    expect(result).toContain(
      '"Post": GassmaPostController<O extends { "Post": infer UO } ? UO extends GassmaPostOmit ? UO : {} : {}, O>;',
    );
  });

  it("should include Controller for each sheet", () => {
    expect(result).toContain("export declare class GassmaUserController");
    expect(result).toContain("export declare class GassmaPostController");
  });

  it("should include Use type for each sheet", () => {
    expect(result).toContain("export type GassmaUserUse = {");
    expect(result).toContain("export type GassmaPostUse = {");
  });

  it("should include FilterConditions types", () => {
    expect(result).toContain("GassmaUseridFilterConditions");
    expect(result).toContain("GassmaPostidFilterConditions");
  });

  it("should include WhereUse types", () => {
    expect(result).toContain("GassmaUserWhereUse");
    expect(result).toContain("GassmaPostWhereUse");
  });

  it("should include FindData types", () => {
    expect(result).toContain("GassmaUserFindData");
    expect(result).toContain("GassmaPostFindData");
  });

  it("should include CreateData types", () => {
    expect(result).toContain("GassmaUserCreateData");
    expect(result).toContain("GassmaPostCreateData");
  });

  it("should include UpdateData types", () => {
    expect(result).toContain("GassmaUserUpdateData");
    expect(result).toContain("GassmaPostUpdateData");
  });

  it("should limit NumberOperation to number columns in update data", () => {
    expect(result).toContain(
      'data: Partial<{ [K in keyof GassmaUserUse]: GassmaUserUse[K] | (K extends "id" ? Gassma.NumberOperation : never) }>;',
    );
  });

  it("should include Select types", () => {
    expect(result).toContain("GassmaUserSelect");
    expect(result).toContain("GassmaPostSelect");
  });

  it("should include Omit types", () => {
    expect(result).toContain("GassmaUserOmit");
    expect(result).toContain("GassmaPostOmit");
  });

  it("should include OrderBy types", () => {
    expect(result).toContain("GassmaUserOrderBy");
    expect(result).toContain("GassmaPostOrderBy");
  });

  it("should include Aggregate types", () => {
    expect(result).toContain("GassmaUserAggregateData");
    expect(result).toContain("GassmaUserAggregateResult");
  });

  it("should include GroupBy types", () => {
    expect(result).toContain("GassmaUserGroupByData");
    expect(result).toContain("GassmaUserGroupByResult");
  });

  it("should include Extension types", () => {
    expect(result).toContain(
      "export type GassmaExtension<O extends GassmaGlobalOmitConfig = {}> = {",
    );
    expect(result).toContain("export type GassmaUserQueryHooks");
    expect(result).toContain("export type GassmaPostQueryHooks");
    expect(result).toContain("export type GassmaAllModelsQueryHooks");
  });

  it("should include result extension types", () => {
    expect(result).toContain("export type GassmaResultScalars<M> =");
    expect(result).toContain(
      "export type GassmaResultExtension<R_, RC_, CMap> = {",
    );
    expect(result).toContain("export type GassmaComputedMap<CMap, R> = {");
    expect(result).toContain("export type GassmaExtendsFn<O extends");
    expect(result).toContain("export type GassmaExtendedClient<O extends");
    expect(result).toContain("  result?: GassmaResultConfig;");
  });
});
