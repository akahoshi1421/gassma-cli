import { getGassmaIgnoreType } from "../../../generate/typeGenerate/gassmaIgnoreType";

describe("getGassmaIgnoreType", () => {
  it("should generate schema-specific ignore config with all models", () => {
    const dictYaml: Record<string, Record<string, unknown[]>> = {
      User: {
        id: ["number"],
        name: ["string"],
        "email?": ["string"],
      },
      Post: {
        id: ["number"],
        title: ["string"],
      },
    };
    const result = getGassmaIgnoreType(dictYaml, "Test");

    expect(result).toContain("export type GassmaTestIgnoreConfig");
    expect(result).toContain('"User"?:');
    expect(result).toContain('"Post"?:');
  });

  it("should include all column names as literal union", () => {
    const dictYaml: Record<string, Record<string, unknown[]>> = {
      User: {
        id: ["number"],
        name: ["string"],
        "email?": ["string"],
      },
    };
    const result = getGassmaIgnoreType(dictYaml, "Test");

    expect(result).toContain('"id"');
    expect(result).toContain('"name"');
    expect(result).toContain('"email"');
  });

  it("should support string | string[] format", () => {
    const dictYaml: Record<string, Record<string, unknown[]>> = {
      User: {
        id: ["number"],
        name: ["string"],
      },
    };
    const result = getGassmaIgnoreType(dictYaml, "Test");

    const columnUnion = '"id" | "name"';
    expect(result).toContain(`${columnUnion} | (${columnUnion})[]`);
  });

  it("should handle empty dictYaml", () => {
    const dictYaml: Record<string, Record<string, unknown[]>> = {};
    const result = getGassmaIgnoreType(dictYaml, "Test");

    expect(result).toContain("export type GassmaTestIgnoreConfig = {}");
  });
});
