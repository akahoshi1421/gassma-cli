import { getGassmaMapSheetsType } from "../../../generate/typeGenerate/gassmaMapSheetsType";

describe("getGassmaMapSheetsType", () => {
  it("should generate type with specific model names", () => {
    const dictYaml = {
      User: { id: ["number"], name: ["string"] },
      Post: { id: ["number"], title: ["string"] },
    };
    const result = getGassmaMapSheetsType(dictYaml, "Test");
    expect(result).toBe(
      `declare type GassmaTestMapSheetsConfig = {\n` +
        `  "User"?: string;\n` +
        `  "Post"?: string;\n` +
        `};\n`,
    );
  });

  it("should generate empty object type when no models", () => {
    const result = getGassmaMapSheetsType({}, "Test");
    expect(result).toBe(`declare type GassmaTestMapSheetsConfig = {};\n`);
  });

  it("should handle single model", () => {
    const dictYaml = {
      User: { id: ["number"] },
    };
    const result = getGassmaMapSheetsType(dictYaml, "Test");
    expect(result).toBe(
      `declare type GassmaTestMapSheetsConfig = {\n` +
        `  "User"?: string;\n` +
        `};\n`,
    );
  });
});
