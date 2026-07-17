import { describe, it, expect } from "vitest";
import { getOneGassmaAggregateField } from "../../../generate/typeGenerate/gassmaAggregateField/oneGassmaAggregateField";

describe("getOneGassmaAggregateField", () => {
  it("should declare AggregateField with T and K extends string parameters", () => {
    const result = getOneGassmaAggregateField("", "User");
    expect(result).toContain(
      "export type GassmaUserAggregateField<T, K extends string>",
    );
  });

  it("should map _count keys to number without null", () => {
    const result = getOneGassmaAggregateField("", "User");
    expect(result).toContain('K extends "_count"');
    expect(result).toContain(
      "{ [P in keyof T as T[P] extends true ? P : never]: number }",
    );
  });

  it("should map _avg and _sum keys to number | null", () => {
    const result = getOneGassmaAggregateField("", "User");
    expect(result).toContain('K extends "_avg" | "_sum"');
    expect(result).toContain(
      "{ [P in keyof T as T[P] extends true ? P : never]: number | null }",
    );
  });

  it("should resolve _min and _max keys via AggregateBaseReturn", () => {
    const result = getOneGassmaAggregateField("", "User");
    expect(result).toContain("P & keyof GassmaUserAggregateBaseReturn");
  });

  it("should map undefined T to never", () => {
    const result = getOneGassmaAggregateField("", "User");
    expect(result).toContain("T extends undefined");
    expect(result).toContain("? never");
  });

  it("should prepend schemaName", () => {
    const result = getOneGassmaAggregateField("Test", "User");
    expect(result).toContain("export type GassmaTestUserAggregateField");
    expect(result).toContain("GassmaTestUserAggregateBaseReturn");
  });
});
