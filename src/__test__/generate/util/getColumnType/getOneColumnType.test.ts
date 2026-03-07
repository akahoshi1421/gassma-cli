import { getOneColumnType } from "../../../../generate/util/getColumnType/getOneColumnType";

describe("getOneColumnType", () => {
  it("should return 'number' as is", () => {
    expect(getOneColumnType("number")).toBe("number");
  });

  it("should return 'string' as is", () => {
    expect(getOneColumnType("string")).toBe("string");
  });

  it("should return 'Date' as is", () => {
    expect(getOneColumnType("Date")).toBe("Date");
  });

  it("should return 'boolean' as is", () => {
    expect(getOneColumnType("boolean")).toBe("boolean");
  });

  it("should convert {{number}} to string literal type", () => {
    expect(getOneColumnType("{{number}}")).toBe('"number"');
  });

  it("should convert {{Date}} to string literal type", () => {
    expect(getOneColumnType("{{Date}}")).toBe('"Date"');
  });

  it("should convert {{boolean}} to string literal type", () => {
    expect(getOneColumnType("{{boolean}}")).toBe('"boolean"');
  });

  it("should convert other strings to string literal type", () => {
    expect(getOneColumnType("abc")).toBe('"abc"');
  });

  it("should return number literal as is", () => {
    expect(getOneColumnType(42)).toBe(42);
  });

  it("should return boolean literal as is", () => {
    expect(getOneColumnType(true)).toBe(true);
  });
});
