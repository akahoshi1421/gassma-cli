import { getOneSheetGassmaFilterConditions } from "../../../generate/typeGenerate/gassmaFilterConditions/oneSheetGassmaFilterConditions";

describe("getOneSheetGassmaFilterConditions", () => {
  it("should include mode property", () => {
    const sheetContent = { id: ["number"] };
    const result = getOneSheetGassmaFilterConditions(sheetContent, "User");

    expect(result).toContain('mode?: "default" | "insensitive"');
  });

  it("should include FieldRef in comparison operators", () => {
    const sheetContent = { id: ["number"] };
    const result = getOneSheetGassmaFilterConditions(sheetContent, "User");

    expect(result).toContain("equals?: number | Gassma.FieldRef");
    expect(result).toContain("lt?: number | Gassma.FieldRef");
    expect(result).toContain("lte?: number | Gassma.FieldRef");
    expect(result).toContain("gt?: number | Gassma.FieldRef");
    expect(result).toContain("gte?: number | Gassma.FieldRef");
    expect(result).toContain("contains?: string | Gassma.FieldRef");
    expect(result).toContain("startsWith?: string | Gassma.FieldRef");
    expect(result).toContain("endsWith?: string | Gassma.FieldRef");
  });
});
