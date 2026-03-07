import { getOneColumnType } from "../../../../generate/util/getColumnType/getOneColumnType";

describe("getOneColumnType", () => {
  it("numberをそのまま返す", () => {
    expect(getOneColumnType("number")).toBe("number");
  });

  it("stringをそのまま返す", () => {
    expect(getOneColumnType("string")).toBe("string");
  });

  it("Dateをそのまま返す", () => {
    expect(getOneColumnType("Date")).toBe("Date");
  });

  it("booleanをそのまま返す", () => {
    expect(getOneColumnType("boolean")).toBe("boolean");
  });

  it("{{number}}を文字列リテラル型にする", () => {
    expect(getOneColumnType("{{number}}")).toBe('"number"');
  });

  it("{{Date}}を文字列リテラル型にする", () => {
    expect(getOneColumnType("{{Date}}")).toBe('"Date"');
  });

  it("{{boolean}}を文字列リテラル型にする", () => {
    expect(getOneColumnType("{{boolean}}")).toBe('"boolean"');
  });

  it("その他の文字列を文字列リテラル型にする", () => {
    expect(getOneColumnType("abc")).toBe('"abc"');
  });

  it("数値はそのまま返す", () => {
    expect(getOneColumnType(42)).toBe(42);
  });

  it("booleanリテラルはそのまま返す", () => {
    expect(getOneColumnType(true)).toBe(true);
  });
});
