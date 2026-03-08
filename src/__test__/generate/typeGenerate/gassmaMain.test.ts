import { getGassmaMain } from "../../../generate/typeGenerate/gassmaMain";

describe("getGassmaMain", () => {
  it("should generate GassmaClient with type parameter via GassmaClientMap", () => {
    const result = getGassmaMain(["User", "Post"], "Test");

    expect(result).toContain("declare namespace Gassma");
    expect(result).toContain("interface GassmaClientMap");
    expect(result).toContain(
      "class GassmaClient<T extends keyof GassmaClientMap>",
    );
    expect(result).toContain('GassmaClientMap[T]["sheets"]');
    expect(result).toContain('GassmaClientMap[T]["options"]');
  });

  it("should add schema entry to GassmaClientMap", () => {
    const result = getGassmaMain(["User", "Post"], "Test");

    expect(result).toContain('"Test": {');
    expect(result).toContain("sheets: GassmaTestSheet");
    expect(result).toContain("options: GassmaTestClientOptions");
  });

  it("should generate GassmaClientOptions type with schema prefix", () => {
    const result = getGassmaMain(["User", "Post"], "Test");

    expect(result).toContain("declare type GassmaTestClientOptions");
    expect(result).toContain("id?: string");
    expect(result).toContain("relations?: Gassma.RelationsConfig");
    expect(result).toContain("omit?: GassmaTestGlobalOmitConfig");
  });

  it("should generate GassmaGlobalOmitConfig with model-specific omit", () => {
    const result = getGassmaMain(["User", "Post"], "Test");

    expect(result).toContain("declare type GassmaTestGlobalOmitConfig");
    expect(result).toContain('"User"?: GassmaTestUserOmit');
    expect(result).toContain('"Post"?: GassmaTestPostOmit');
  });

  it("should generate FieldRef class in namespace", () => {
    const result = getGassmaMain(["User"], "");

    expect(result).toContain("class FieldRef");
    expect(result).toContain("readonly modelName: string");
    expect(result).toContain("readonly name: string");
  });

  it("should handle sheet names with special characters", () => {
    const result = getGassmaMain(["My Sheet"], "Test");

    expect(result).toContain('"My Sheet"?: GassmaTestMySheetOmit');
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

  it("should exclude common types when includeCommon is false", () => {
    const result = getGassmaMain(["User"], "Test", false);

    expect(result).not.toContain("class FieldRef");
    expect(result).not.toContain("type RelationsConfig =");
    expect(result).toContain("GassmaClientMap");
  });
});
