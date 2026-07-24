import { describe, it, expect } from "vitest";
import { getGassmaManyCount } from "../../../generate/typeGenerate/gassmaManyCount";

describe("getGassmaManyCount", () => {
  it("should emit ManyReturn with { count: number }", () => {
    const result = getGassmaManyCount();
    expect(result).toContain("export type ManyReturn = {");
    expect(result).toContain("count: number;");
  });

  it("should emit CreateManyReturn / UpdateManyReturn / DeleteManyReturn aliases", () => {
    const result = getGassmaManyCount();
    expect(result).toContain("export type CreateManyReturn = ManyReturn;");
    expect(result).toContain("export type UpdateManyReturn = ManyReturn;");
    expect(result).toContain("export type DeleteManyReturn = ManyReturn;");
  });
});
