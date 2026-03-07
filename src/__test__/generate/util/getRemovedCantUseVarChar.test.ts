import { getRemovedCantUseVarChar } from "../../../generate/util/getRemovedCantUseVarChar";

describe("getRemovedCantUseVarChar", () => {
  it("should return Japanese sheet name as is", () => {
    expect(getRemovedCantUseVarChar("シート1")).toBe("シート1");
  });

  it("should remove half-width spaces", () => {
    expect(getRemovedCantUseVarChar("user data")).toBe("userdata");
  });

  it("should remove full-width spaces", () => {
    expect(getRemovedCantUseVarChar("ユーザー　データ")).toBe("ユーザーデータ");
  });

  it("should remove hyphens", () => {
    expect(getRemovedCantUseVarChar("my-sheet")).toBe("mysheet");
  });

  it("should remove multiple symbols", () => {
    expect(getRemovedCantUseVarChar("a!b@c#d")).toBe("abcd");
  });

  it("should return name unchanged when no symbols present", () => {
    expect(getRemovedCantUseVarChar("Users")).toBe("Users");
  });
});
