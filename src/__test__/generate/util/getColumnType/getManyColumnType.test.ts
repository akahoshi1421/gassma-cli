import { getManyColumnType } from "../../../../generate/util/getColumnType/getManyColumType";

describe("getManyColumnType", () => {
  it("should generate union type from string literals", () => {
    expect(getManyColumnType(["abc", "def", "hij"])).toBe(
      '"abc" | "def" | "hij"',
    );
  });

  it("should generate union type from type keywords", () => {
    expect(getManyColumnType(["string", "Date"])).toBe("string | Date");
  });

  it("should generate union type from number literals", () => {
    expect(getManyColumnType([1, 2, 3])).toBe("1 | 2 | 3");
  });

  it("should generate union type from mixed types", () => {
    expect(getManyColumnType(["string", 42, true])).toBe("string | 42 | true");
  });
});
