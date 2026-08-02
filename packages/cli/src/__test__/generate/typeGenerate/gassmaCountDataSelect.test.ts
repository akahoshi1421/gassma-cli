import { describe, expect, it } from "vitest";
import { getOneGassmaCountData } from "../../../generate/typeGenerate/gassmaCountData/oneGassmaCountData";
import { getOneGassmaCountResult } from "../../../generate/typeGenerate/gassmaCountResult/oneGassmaCountResult";

describe("count select", () => {
  it("should add select to CountData", () => {
    const result = getOneGassmaCountData("", "User");

    expect(result).toContain("select?: GassmaUserCountSelect | true;");
  });

  it("should add SkipValue to select in strict mode", () => {
    const result = getOneGassmaCountData("", "User", true);

    expect(result).toContain(
      "select?: GassmaUserCountSelect | true | Gassma.SkipValue;",
    );
  });

  it("should generate CountResult switching on select", () => {
    const result = getOneGassmaCountResult("", "User");

    expect(result).toContain(
      "export type GassmaUserCountResult<T extends GassmaUserCountData> =",
    );
    expect(result).toContain("T extends { select: infer S }");
    expect(result).toContain("? S extends true");
    expect(result).toContain(": { [K in keyof S]: number }");
    expect(result).toContain(": number;");
  });

  it("should generate CountResult with schema name", () => {
    const result = getOneGassmaCountResult("App", "User");

    expect(result).toContain(
      "export type GassmaAppUserCountResult<T extends GassmaAppUserCountData> =",
    );
  });
});
