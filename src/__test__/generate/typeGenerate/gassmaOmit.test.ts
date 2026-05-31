import { describe, it, expect } from "vitest";
import { getOneGassmaOmit } from "../../../generate/typeGenerate/gassmaOmit/oneGassmaOmit";

describe("getOneGassmaOmit", () => {
  it("should emit Omit with each column as optional true | false", () => {
    const result = getOneGassmaOmit({ id: [1], name: ["a"] }, "", "User");
    expect(result).toContain("export type GassmaUserOmit = {");
    expect(result).toContain('"id"?: true | false;');
    expect(result).toContain('"name"?: true | false;');
  });

  it("should strip trailing ? from column names", () => {
    const result = getOneGassmaOmit({ "name?": ["a"] }, "", "User");
    expect(result).toContain('"name"?: true | false;');
    expect(result).not.toContain('"name?"');
  });

  it("should prepend schemaName", () => {
    const result = getOneGassmaOmit({ id: [1] }, "Test", "User");
    expect(result).toContain("export type GassmaTestUserOmit");
  });
});
