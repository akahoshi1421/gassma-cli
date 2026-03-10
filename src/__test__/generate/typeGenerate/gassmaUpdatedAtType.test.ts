import { getGassmaUpdatedAtType } from "../../../generate/typeGenerate/gassmaUpdatedAtType";

describe("getGassmaUpdatedAtType", () => {
  it("should generate schema-specific updatedAt config with column name literals", () => {
    const dictYaml: Record<string, Record<string, unknown[]>> = {
      Post: {
        id: ["number"],
        title: ["string"],
        "updatedAt?": ["Date"],
      },
    };
    const result = getGassmaUpdatedAtType(dictYaml, ["Post"], "Test");

    expect(result).toContain("declare type GassmaTestUpdatedAtConfig");
    expect(result).toContain('"Post"?:');
  });

  it("should include all column names as literal union for the model", () => {
    const dictYaml: Record<string, Record<string, unknown[]>> = {
      Post: {
        id: ["number"],
        title: ["string"],
        "content?": ["string"],
        "updatedAt?": ["Date"],
      },
    };
    const result = getGassmaUpdatedAtType(dictYaml, ["Post"], "Test");

    expect(result).toContain('"id"');
    expect(result).toContain('"title"');
    expect(result).toContain('"content"');
    expect(result).toContain('"updatedAt"');
  });

  it("should support string | string[] format", () => {
    const dictYaml: Record<string, Record<string, unknown[]>> = {
      Post: {
        id: ["number"],
        title: ["string"],
      },
    };
    const result = getGassmaUpdatedAtType(dictYaml, ["Post"], "Test");

    // string | string[] の形式
    const columnUnion = '"id" | "title"';
    expect(result).toContain(`${columnUnion} | (${columnUnion})[]`);
  });

  it("should only include models that have updatedAt fields", () => {
    const dictYaml: Record<string, Record<string, unknown[]>> = {
      User: {
        id: ["number"],
        name: ["string"],
      },
      Post: {
        id: ["number"],
        title: ["string"],
        "updatedAt?": ["Date"],
      },
    };
    const result = getGassmaUpdatedAtType(dictYaml, ["Post"], "Test");

    expect(result).not.toContain('"User"');
    expect(result).toContain('"Post"?:');
  });

  it("should handle multiple models with updatedAt", () => {
    const dictYaml: Record<string, Record<string, unknown[]>> = {
      Post: {
        id: ["number"],
        title: ["string"],
      },
      Product: {
        id: ["number"],
        name: ["string"],
      },
    };
    const result = getGassmaUpdatedAtType(
      dictYaml,
      ["Post", "Product"],
      "Test",
    );

    expect(result).toContain('"Post"?:');
    expect(result).toContain('"Product"?:');
  });

  it("should return empty config when no models have updatedAt", () => {
    const dictYaml: Record<string, Record<string, unknown[]>> = {
      User: { id: ["number"] },
    };
    const result = getGassmaUpdatedAtType(dictYaml, [], "Test");

    expect(result).toContain("declare type GassmaTestUpdatedAtConfig = {}");
  });
});
