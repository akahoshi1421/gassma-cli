import { generateClientDts } from "../../../generate/jsGenerate/generateClientDts";

describe("generateClientDts", () => {
  it("should declare createGassmaXxxClient function with schema type parameter", () => {
    const result = generateClientDts("Hoge");

    expect(result).toContain("function createGassmaHogeClient");
    expect(result).toContain('Gassma.GassmaClient<"Hoge">');
  });

  it("should accept optional GassmaClientOptions parameter", () => {
    const result = generateClientDts("Hoge");

    expect(result).toContain("options?: GassmaHogeClientOptions");
  });

  it("should work with different schema names", () => {
    const result = generateClientDts("Fuga");

    expect(result).toContain("function createGassmaFugaClient");
    expect(result).toContain('Gassma.GassmaClient<"Fuga">');
    expect(result).toContain("options?: GassmaFugaClientOptions");
  });
});
