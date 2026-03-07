import { getColumnType } from "../../../../generate/util/getColumnType";

describe("getColumnType", () => {
  it("should return single type for single element array", () => {
    expect(getColumnType(["number"])).toBe("number");
  });

  it("should return string literal type for single string element", () => {
    expect(getColumnType(["abc"])).toBe('"abc"');
  });

  it("should return union type for multiple elements", () => {
    expect(getColumnType(["abc", "def"])).toBe('"abc" | "def"');
  });
});
