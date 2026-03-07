import { getManyColumnType } from "../../../../generate/util/getColumnType/getManyColumType";

describe("getManyColumnType", () => {
  it("文字列リテラルのユニオン型を生成する", () => {
    expect(getManyColumnType(["abc", "def", "hij"])).toBe(
      '"abc" | "def" | "hij"',
    );
  });

  it("型キーワードのユニオン型を生成する", () => {
    expect(getManyColumnType(["string", "Date"])).toBe("string | Date");
  });

  it("数値リテラルのユニオン型を生成する", () => {
    expect(getManyColumnType([1, 2, 3])).toBe("1 | 2 | 3");
  });

  it("混合型のユニオン型を生成する", () => {
    expect(getManyColumnType(["string", 42, true])).toBe("string | 42 | true");
  });
});
