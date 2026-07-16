import { describe, it, expect } from "vitest";
import { getOneGassmaAggregateBaseReturn } from "../../../generate/typeGenerate/gassmaAggregateBaseReturn/oneGassmaAggregateBaseReturn";

describe("getOneGassmaAggregateBaseReturn", () => {
  it("should emit AggregateBaseReturn declaration", () => {
    const result = getOneGassmaAggregateBaseReturn({}, "", "User");
    expect(result).toContain("export type GassmaUserAggregateBaseReturn = {");
  });

  it("should include numeric columns with aggregate type", () => {
    const result = getOneGassmaAggregateBaseReturn(
      { price: ["number"] },
      "",
      "Product",
    );
    expect(result).toContain('"price": number');
  });

  it("should preserve special type hints (string/Date/boolean) as aggregate type", () => {
    const result = getOneGassmaAggregateBaseReturn(
      { when: ["Date"] },
      "",
      "User",
    );
    expect(result).toContain('"when": Date');
  });

  it("should preserve enum literal unions instead of widening to string", () => {
    const result = getOneGassmaAggregateBaseReturn(
      { role: ["ADMIN", "USER", "MODERATOR"] },
      "",
      "Member",
    );
    expect(result).toContain('"role": "ADMIN" | "USER" | "MODERATOR"');
  });

  it("should preserve addType unions instead of widening to the base type", () => {
    const result = getOneGassmaAggregateBaseReturn(
      { rating: ["number", "string", "boolean"] },
      "",
      "User",
    );
    expect(result).toContain('"rating": number | string | boolean');
  });

  it("should preserve replaceType literal unions", () => {
    const result = getOneGassmaAggregateBaseReturn(
      { size: ["small", "large"] },
      "",
      "Member",
    );
    expect(result).toContain('"size": "small" | "large"');
  });

  it("should strip ? from optional column names", () => {
    const result = getOneGassmaAggregateBaseReturn(
      { "age?": ["number"] },
      "",
      "User",
    );
    expect(result).toContain('"age": number');
    expect(result).not.toContain('"age?"');
  });

  it("should prepend schemaName", () => {
    const result = getOneGassmaAggregateBaseReturn({}, "Test", "User");
    expect(result).toContain("export type GassmaTestUserAggregateBaseReturn");
  });
});
