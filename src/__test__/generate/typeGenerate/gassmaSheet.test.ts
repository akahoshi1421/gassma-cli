import { getGassmaSheet } from "../../../generate/typeGenerate/gassmaSheet";

describe("getGassmaSheet", () => {
  it("シート名に対応するController型のマッピングを生成する", () => {
    const result = getGassmaSheet(["User", "Post"]);

    expect(result).toContain("declare type GassmaSheet = {");
    expect(result).toContain('"User": GassmaUserController;');
    expect(result).toContain('"Post": GassmaPostController;');
    expect(result).toContain("};");
  });

  it("記号入りシート名は変数名部分のみ記号除去する", () => {
    const result = getGassmaSheet(["my-sheet"]);

    expect(result).toContain('"my-sheet": GassmamysheetController;');
  });

  it("空配列の場合は空のオブジェクト型を生成する", () => {
    const result = getGassmaSheet([]);

    expect(result).toBe("declare type GassmaSheet = {\n};\n");
  });
});
