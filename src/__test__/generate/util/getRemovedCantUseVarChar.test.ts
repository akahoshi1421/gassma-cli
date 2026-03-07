import { getRemovedCantUseVarChar } from "../../../generate/util/getRemovedCantUseVarChar";

describe("getRemovedCantUseVarChar", () => {
  it("日本語シート名はそのまま返す", () => {
    expect(getRemovedCantUseVarChar("シート1")).toBe("シート1");
  });

  it("半角スペースを除去する", () => {
    expect(getRemovedCantUseVarChar("user data")).toBe("userdata");
  });

  it("全角スペースを除去する", () => {
    expect(getRemovedCantUseVarChar("ユーザー　データ")).toBe("ユーザーデータ");
  });

  it("ハイフンを除去する", () => {
    expect(getRemovedCantUseVarChar("my-sheet")).toBe("mysheet");
  });

  it("複数の記号を除去する", () => {
    expect(getRemovedCantUseVarChar("a!b@c#d")).toBe("abcd");
  });

  it("記号がない場合はそのまま返す", () => {
    expect(getRemovedCantUseVarChar("Users")).toBe("Users");
  });
});
