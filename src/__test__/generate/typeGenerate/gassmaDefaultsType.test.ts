import { getGassmaDefaultsType } from "../../../generate/typeGenerate/gassmaDefaultsType";
import type { DefaultsConfig } from "../../../generate/read/extractDefaults";

describe("getGassmaDefaultsType", () => {
  it("should generate schema-specific defaults config with correct field types", () => {
    const dictYaml: Record<string, Record<string, unknown[]>> = {
      User: {
        id: ["number"],
        name: ["string"],
        "isActive?": ["boolean"],
        "createdAt?": ["Date"],
      },
    };
    const defaults: DefaultsConfig = {
      User: {
        isActive: { kind: "static", value: true },
        createdAt: { kind: "function", name: "now" },
      },
    };
    const result = getGassmaDefaultsType(dictYaml, defaults, "Test");

    expect(result).toContain("export type GassmaTestDefaultsConfig");
    expect(result).toContain('"User"?:');
    expect(result).toContain('"isActive"?: boolean | (() => boolean)');
    expect(result).toContain('"createdAt"?: Date | (() => Date)');
  });

  it("should not include models without defaults", () => {
    const dictYaml: Record<string, Record<string, unknown[]>> = {
      User: {
        id: ["number"],
        "isActive?": ["boolean"],
      },
      Tag: {
        id: ["number"],
        name: ["string"],
      },
    };
    const defaults: DefaultsConfig = {
      User: {
        isActive: { kind: "static", value: true },
      },
    };
    const result = getGassmaDefaultsType(dictYaml, defaults, "Test");

    expect(result).toContain('"User"?:');
    expect(result).not.toContain('"Tag"');
  });

  it("should handle multiple models with defaults", () => {
    const dictYaml: Record<string, Record<string, unknown[]>> = {
      User: {
        id: ["number"],
        "isActive?": ["boolean"],
      },
      Post: {
        id: ["number"],
        "published?": ["boolean"],
        "viewCount?": ["number"],
      },
    };
    const defaults: DefaultsConfig = {
      User: {
        isActive: { kind: "static", value: true },
      },
      Post: {
        published: { kind: "static", value: false },
        viewCount: { kind: "static", value: 0 },
      },
    };
    const result = getGassmaDefaultsType(dictYaml, defaults, "Test");

    expect(result).toContain('"User"?:');
    expect(result).toContain('"Post"?:');
    expect(result).toContain('"isActive"?: boolean | (() => boolean)');
    expect(result).toContain('"published"?: boolean | (() => boolean)');
    expect(result).toContain('"viewCount"?: number | (() => number)');
  });

  it("should return empty config when no defaults exist", () => {
    const dictYaml: Record<string, Record<string, unknown[]>> = {
      User: { id: ["number"] },
    };
    const defaults: DefaultsConfig = {};
    const result = getGassmaDefaultsType(dictYaml, defaults, "Test");

    expect(result).toContain("export type GassmaTestDefaultsConfig = {}");
  });

  it("should handle union types in field", () => {
    const dictYaml: Record<string, Record<string, unknown[]>> = {
      Post: {
        id: ["number"],
        "content?": ["string", "number"],
      },
    };
    const defaults: DefaultsConfig = {
      Post: {
        content: { kind: "static", value: "" },
      },
    };
    const result = getGassmaDefaultsType(dictYaml, defaults, "Test");

    expect(result).toContain(
      '"content"?: string | number | (() => string | number)',
    );
  });
});
