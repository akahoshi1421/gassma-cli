import { getGassmaSheet } from "../../../generate/typeGenerate/gassmaSheet";

describe("getGassmaSheet", () => {
  it("should generate controller type mapping for sheet names", () => {
    const result = getGassmaSheet(["User", "Post"], "");

    expect(result).toContain(
      "declare type GassmaSheet<O extends GassmaGlobalOmitConfig = {}> = {",
    );
    expect(result).toContain(
      '"User": GassmaUserController<O extends { "User": infer UO } ? UO extends GassmaUserOmit ? UO : {} : {}>;',
    );
    expect(result).toContain(
      '"Post": GassmaPostController<O extends { "Post": infer UO } ? UO extends GassmaPostOmit ? UO : {} : {}>;',
    );
    expect(result).toContain("};");
  });

  it("should remove symbols only from variable name part", () => {
    const result = getGassmaSheet(["my-sheet"], "");

    expect(result).toContain(
      '"my-sheet": GassmamysheetController<O extends { "my-sheet": infer UO } ? UO extends GassmamysheetOmit ? UO : {} : {}>;',
    );
  });

  it("should generate empty object type for empty array", () => {
    const result = getGassmaSheet([], "");

    expect(result).toBe(
      "declare type GassmaSheet<O extends GassmaGlobalOmitConfig = {}> = {\n};\n",
    );
  });
});
