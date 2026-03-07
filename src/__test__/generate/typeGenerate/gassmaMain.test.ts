import { getGassmaMain } from "../../../generate/typeGenerate/gassmaMain";

describe("getGassmaMain", () => {
  it("GassmaClientクラスを含むnamespace宣言を生成する", () => {
    const result = getGassmaMain();

    expect(result).toContain("declare namespace Gassma");
    expect(result).toContain("class GassmaClient");
    expect(result).toContain("constructor(id?: string)");
    expect(result).toContain("readonly sheets: GassmaSheet");
  });
});
