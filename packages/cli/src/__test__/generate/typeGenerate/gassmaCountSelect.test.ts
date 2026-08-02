import { describe, it, expect } from "vitest";
import { getOneGassmaCountSelect } from "../../../generate/typeGenerate/gassmaSelect/oneGassmaCountSelect";

describe("getOneGassmaCountSelect", () => {
  it("should extend Select with _all", () => {
    const result = getOneGassmaCountSelect("", "User");
    expect(result).toContain(
      "export type GassmaUserCountSelect = GassmaUserSelect & {",
    );
    expect(result).toContain('"_all"?: true;');
  });

  it("should prepend schemaName", () => {
    const result = getOneGassmaCountSelect("Test", "User");
    expect(result).toContain(
      "export type GassmaTestUserCountSelect = GassmaTestUserSelect & {",
    );
  });
});
