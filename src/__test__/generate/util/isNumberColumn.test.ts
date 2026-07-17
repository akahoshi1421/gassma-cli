import { describe, it, expect } from "vitest";
import { isNumberColumn } from "../../../generate/util/isNumberColumn";

describe("isNumberColumn", () => {
  it("should return true for a number column", () => {
    expect(isNumberColumn(["number"])).toBe(true);
  });

  it("should return true for addType union containing number", () => {
    expect(isNumberColumn(["number", "string", "boolean"])).toBe(true);
  });

  it("should return false for non-number columns", () => {
    expect(isNumberColumn(["string"])).toBe(false);
    expect(isNumberColumn(["boolean"])).toBe(false);
    expect(isNumberColumn(["Date"])).toBe(false);
  });

  it("should return false for {{number}} literal (replaceType) columns", () => {
    expect(isNumberColumn(["{{number}}"])).toBe(false);
  });

  it("should return false for empty type list", () => {
    expect(isNumberColumn([])).toBe(false);
  });
});
