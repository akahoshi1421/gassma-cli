import { getGassmaMain } from "../../../generate/typeGenerate/gassmaMain";

describe("getGassmaMain", () => {
  it("should generate namespace declaration with GassmaClient class", () => {
    const result = getGassmaMain(["User", "Post"], "");

    expect(result).toContain("declare namespace Gassma");
    expect(result).toContain("class GassmaClient");
    expect(result).toContain(
      "constructor(idOrOptions?: string | GassmaClientOptions)",
    );
    expect(result).toContain("readonly sheets: GassmaSheet");
  });

  it("should generate GassmaClientOptions type", () => {
    const result = getGassmaMain(["User", "Post"], "");

    expect(result).toContain("declare type GassmaClientOptions");
    expect(result).toContain("id?: string");
    expect(result).toContain("relations?: Gassma.RelationsConfig");
    expect(result).toContain("omit?: GassmaGlobalOmitConfig");
  });

  it("should generate GassmaGlobalOmitConfig with model-specific omit", () => {
    const result = getGassmaMain(["User", "Post"], "");

    expect(result).toContain("declare type GassmaGlobalOmitConfig");
    expect(result).toContain('"User"?: GassmaUserOmit');
    expect(result).toContain('"Post"?: GassmaPostOmit');
  });

  it("should generate FieldRef class in namespace", () => {
    const result = getGassmaMain(["User"], "");

    expect(result).toContain("class FieldRef");
    expect(result).toContain("readonly modelName: string");
    expect(result).toContain("readonly name: string");
  });

  it("should handle sheet names with special characters", () => {
    const result = getGassmaMain(["My Sheet"], "");

    expect(result).toContain('"My Sheet"?: GassmaMySheetOmit');
  });

  it("should include common types in namespace", () => {
    const result = getGassmaMain(["User"], "");

    expect(result).toContain("type RelationsConfig =");
    expect(result).toContain("type NumberOperation =");
    expect(result).toContain("type ManyReturn =");
    expect(result).toContain("type NestedWriteOperation =");
    expect(result).toContain("type SortOrderInput =");
    expect(result).toContain("type IncludeData =");
    expect(result).toContain("type CountValue =");
  });
});
