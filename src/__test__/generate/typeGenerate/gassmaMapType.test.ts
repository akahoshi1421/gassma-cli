import { getGassmaMapType } from "../../../generate/typeGenerate/gassmaMapType";

describe("getGassmaMapType", () => {
  it("should generate schema-specific map config with all models", () => {
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
    const result = getGassmaMapType(dictYaml, "Test");

    expect(result).toContain("declare type GassmaTestMapConfig");
    expect(result).toContain('"User"?:');
    expect(result).toContain('"Post"?:');
  });

  it("should use field names as keys with string values", () => {
    const dictYaml: Record<string, Record<string, unknown[]>> = {
      User: {
        id: ["number"],
        name: ["string"],
        "email?": ["string"],
      },
    };
    const result = getGassmaMapType(dictYaml, "Test");

    expect(result).toContain('"id"?: string');
    expect(result).toContain('"name"?: string');
    expect(result).toContain('"email"?: string');
  });

  it("should handle empty dictYaml", () => {
    const dictYaml: Record<string, Record<string, unknown[]>> = {};
    const result = getGassmaMapType(dictYaml, "Test");

    expect(result).toContain("declare type GassmaTestMapConfig = {}");
  });

  it("should use schema name in type name", () => {
    const dictYaml: Record<string, Record<string, unknown[]>> = {
      User: { id: ["number"] },
    };
    const result = getGassmaMapType(dictYaml, "Fuga");

    expect(result).toContain("declare type GassmaFugaMapConfig");
  });
});
