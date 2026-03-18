import { getGassmaIgnoreSheetsType } from "../../../generate/typeGenerate/gassmaIgnoreSheetsType";

describe("getGassmaIgnoreSheetsType", () => {
  it("should generate union type from model names", () => {
    const dictYaml = {
      User: { id: ["number"], name: ["string"] },
      Post: { id: ["number"], title: ["string"] },
    };
    const result = getGassmaIgnoreSheetsType(dictYaml, "Test");
    expect(result).toBe(
      `export type GassmaTestIgnoreSheetsConfig = "User" | "Post" | ("User" | "Post")[];\n`,
    );
  });

  it("should generate empty object type when no models", () => {
    const result = getGassmaIgnoreSheetsType({}, "Test");
    expect(result).toBe(`export type GassmaTestIgnoreSheetsConfig = never;\n`);
  });

  it("should handle single model", () => {
    const dictYaml = {
      User: { id: ["number"] },
    };
    const result = getGassmaIgnoreSheetsType(dictYaml, "Test");
    expect(result).toBe(
      `export type GassmaTestIgnoreSheetsConfig = "User" | ("User")[];\n`,
    );
  });
});
