import { describe, expect, it } from "vitest";
import { getOneGassmaUpdateManyAndReturnData } from "../../../generate/typeGenerate/gassmaUpdateData/oneGassmaUpdateManyAndReturnData";
import { buildUpdateDataType } from "../../../generate/typeGenerate/util/buildUpdateDataType";

describe("UpdateManyAndReturnData", () => {
  const sheetContent = { id: ["number"], name: ["string"] };

  it("should extend UpdateData shape with select / omit / include", () => {
    const result = getOneGassmaUpdateManyAndReturnData(
      "",
      "User",
      sheetContent,
    );

    expect(result).toContain(
      "export type GassmaUserUpdateManyAndReturnData = {",
    );
    expect(result).toContain("where?: GassmaUserWhereUse;");
    expect(result).toContain(
      `data: ${buildUpdateDataType("GassmaUserUse", sheetContent)};`,
    );
    expect(result).toContain("limit?: number;");
    expect(result).toContain("include?: GassmaUserInclude;");
    expect(result).toContain(
      "} & ({ select?: GassmaUserSelect; omit?: never } | { select?: never; omit?: GassmaUserOmit });",
    );
  });

  it("should generate type with schema name", () => {
    const result = getOneGassmaUpdateManyAndReturnData(
      "App",
      "User",
      sheetContent,
    );

    expect(result).toContain(
      "export type GassmaAppUserUpdateManyAndReturnData = {",
    );
    expect(result).toContain("include?: GassmaAppUserInclude;");
  });

  it("should add SkipValue to optional members in strict mode", () => {
    const result = getOneGassmaUpdateManyAndReturnData(
      "",
      "User",
      sheetContent,
      true,
    );

    expect(result).toContain("where?: GassmaUserWhereUse | Gassma.SkipValue;");
    expect(result).toContain("include?: GassmaUserInclude | Gassma.SkipValue;");
    expect(result).toContain(
      "select?: GassmaUserSelect | Gassma.SkipValue; omit?: never",
    );
    expect(result).toContain(
      "select?: never; omit?: GassmaUserOmit | Gassma.SkipValue",
    );
  });
});
