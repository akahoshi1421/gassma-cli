import { getColumnType } from "../../../../generate/util/getColumnType";

describe("getColumnType", () => {
  it("要素1つの場合は単一型を返す", () => {
    expect(getColumnType(["number"])).toBe("number");
  });

  it("要素1つの文字列リテラルの場合", () => {
    expect(getColumnType(["abc"])).toBe('"abc"');
  });

  it("複数要素の場合はユニオン型を返す", () => {
    expect(getColumnType(["abc", "def"])).toBe('"abc" | "def"');
  });
});
