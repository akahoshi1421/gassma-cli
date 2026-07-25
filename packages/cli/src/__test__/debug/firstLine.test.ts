import { describe, expect, it } from "vitest";
import { firstLine } from "../../debug/util/firstLine";

describe("firstLine", () => {
  it("should return a single-line string as is", () => {
    expect(firstLine("hello")).toBe("hello");
  });

  it("should return only the first line of a multi-line string", () => {
    expect(firstLine("first\nsecond\nthird")).toBe("first");
  });

  it("should trim trailing carriage returns", () => {
    expect(firstLine("first\r\nsecond")).toBe("first");
  });
});
