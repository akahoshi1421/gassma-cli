import { describe, expect, it } from "vitest";
import { getGassmaCreateReturn } from "../../../../generate/typeGenerate/gassmaCreateReturn";

const BLANK_DOC_LINE = " * ";

describe("getGassmaCreateReturn tsdoc", () => {
  it("should document the row type with the model name", () => {
    const result = getGassmaCreateReturn({ Post: { title: ["string"] } }, "");

    expect(result).toContain(
      [
        "/**",
        " * Model Post",
        BLANK_DOC_LINE,
        " */",
        "export type GassmaPostCreateReturn = {",
      ].join("\n"),
    );
  });

  it("should keep the original model name for cleaned type names", () => {
    const result = getGassmaCreateReturn(
      { "my-sheet": { title: ["string"] } },
      "",
    );

    expect(result).toContain(" * Model my-sheet\n");
    expect(result).toContain("export type GassmamysheetCreateReturn = {");
  });
});
