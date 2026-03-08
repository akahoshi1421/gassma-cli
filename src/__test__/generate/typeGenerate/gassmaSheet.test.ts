import { getGassmaSheet } from "../../../generate/typeGenerate/gassmaSheet";

describe("getGassmaSheet", () => {
  it("should generate controller type mapping for sheet names", () => {
    const result = getGassmaSheet(["User", "Post"], "");

    expect(result).toContain("declare type GassmaSheet = {");
    expect(result).toContain('"User": GassmaUserController;');
    expect(result).toContain('"Post": GassmaPostController;');
    expect(result).toContain("};");
  });

  it("should remove symbols only from variable name part", () => {
    const result = getGassmaSheet(["my-sheet"], "");

    expect(result).toContain('"my-sheet": GassmamysheetController;');
  });

  it("should generate empty object type for empty array", () => {
    const result = getGassmaSheet([], "");

    expect(result).toBe("declare type GassmaSheet = {\n};\n");
  });
});
