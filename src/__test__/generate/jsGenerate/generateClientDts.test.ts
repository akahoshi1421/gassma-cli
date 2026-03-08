import { generateClientDts } from "../../../generate/jsGenerate/generateClientDts";

describe("generateClientDts", () => {
  it("should export GassmaClient class", () => {
    const result = generateClientDts("Hoge");

    expect(result).toContain("export declare class GassmaClient");
  });

  it("should have constructor with optional GassmaClientOptions", () => {
    const result = generateClientDts("Hoge");

    expect(result).toContain("options?: GassmaHogeClientOptions");
  });

  it("should have readonly sheets property with schema-specific type", () => {
    const result = generateClientDts("Hoge");

    expect(result).toContain("readonly sheets: GassmaHogeSheet");
  });

  it("should work with different schema names", () => {
    const result = generateClientDts("Fuga");

    expect(result).toContain("export declare class GassmaClient");
    expect(result).toContain("options?: GassmaFugaClientOptions");
    expect(result).toContain("readonly sheets: GassmaFugaSheet");
  });
});
