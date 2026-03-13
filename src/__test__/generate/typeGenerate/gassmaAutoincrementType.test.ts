import { getGassmaAutoincrementType } from "../../../generate/typeGenerate/gassmaAutoincrementType";

describe("getGassmaAutoincrementType", () => {
  it("should generate type with specific model and field names", () => {
    const dictYaml = {
      User: { id: ["number"], name: ["string"] },
      Post: { id: ["number"], title: ["string"] },
    };
    const result = getGassmaAutoincrementType(
      dictYaml,
      ["User", "Post"],
      "Test",
    );
    expect(result).toBe(
      `declare type GassmaTestAutoincrementConfig = {\n` +
        `  "User"?: "id" | "name" | ("id" | "name")[];\n` +
        `  "Post"?: "id" | "title" | ("id" | "title")[];\n` +
        `};\n`,
    );
  });

  it("should generate empty object type when no models", () => {
    const result = getGassmaAutoincrementType({}, [], "Test");
    expect(result).toBe(`declare type GassmaTestAutoincrementConfig = {};\n`);
  });

  it("should handle single model", () => {
    const dictYaml = {
      User: { id: ["number"], name: ["string"] },
    };
    const result = getGassmaAutoincrementType(dictYaml, ["User"], "Test");
    expect(result).toBe(
      `declare type GassmaTestAutoincrementConfig = {\n` +
        `  "User"?: "id" | "name" | ("id" | "name")[];\n` +
        `};\n`,
    );
  });
});
