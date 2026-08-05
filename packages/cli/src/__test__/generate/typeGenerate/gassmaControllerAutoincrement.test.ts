import { describe, expect, it } from "vitest";
import { generater } from "../../../generate/generator";
import { getGassmaController } from "../../../generate/typeGenerate/gassmaController";
import { getOneGassmaController } from "../../../generate/typeGenerate/gassmaController/oneGassmaController";

describe("getOneGassmaController autoincrement counter", () => {
  it("should narrow field to the only autoincrement field of the model", () => {
    const result = getOneGassmaController("", "User", ["id", "name"], ["id"]);

    expect(result).toContain('$getAutoincrement(field: "id"): number;');
    expect(result).toContain(
      '$setAutoincrement(field: "id", next: number): void;',
    );
    expect(result).toContain('$syncAutoincrement(field: "id"): number;');
  });

  it("should union every autoincrement field of the model", () => {
    const result = getOneGassmaController(
      "",
      "User",
      ["id", "seq", "name"],
      ["id", "seq"],
    );

    expect(result).toContain('$getAutoincrement(field: "id" | "seq"): number;');
    expect(result).toContain(
      '$setAutoincrement(field: "id" | "seq", next: number): void;',
    );
    expect(result).toContain(
      '$syncAutoincrement(field: "id" | "seq"): number;',
    );
  });

  it("should type field as never when the model has no autoincrement field", () => {
    const result = getOneGassmaController(
      "",
      "Enrollment",
      ["studentId", "courseId"],
      [],
    );

    expect(result).toContain("$getAutoincrement(field: never): number;");
    expect(result).toContain(
      "$setAutoincrement(field: never, next: number): void;",
    );
    expect(result).toContain("$syncAutoincrement(field: never): number;");
  });

  it("should type field as never when no autoincrement fields are given", () => {
    const result = getOneGassmaController("", "User", ["id"]);

    expect(result).toContain("$getAutoincrement(field: never): number;");
  });

  it("should not leak another model's autoincrement field", () => {
    const result = getOneGassmaController("", "User", ["id", "name"], ["id"]);

    expect(result).not.toContain('$getAutoincrement(field: "name")');
  });
});

describe("getGassmaController autoincrement counter", () => {
  const dictYaml = {
    User: { id: ["number"], name: ["string"] },
    Enrollment: { studentId: ["number"], courseId: ["number"] },
  };

  it("should give each model only its own autoincrement fields", () => {
    const result = getGassmaController(dictYaml, "", { User: ["id"] });

    expect(result).toContain('$getAutoincrement(field: "id"): number;');
    expect(result).toContain("$getAutoincrement(field: never): number;");
  });

  it("should type every model as never when nothing is autoincrement", () => {
    const result = getGassmaController(dictYaml, "");

    expect(result).not.toContain('$getAutoincrement(field: "');
  });
});

describe("generater autoincrement counter", () => {
  const dictYaml = {
    User: { id: ["number"], name: ["string"] },
    Enrollment: { studentId: ["number"], courseId: ["number"] },
  };

  it("should pass the extracted autoincrement config down to the controllers", () => {
    const result = generater(dictYaml, undefined, "", true, undefined, [], {
      User: ["id"],
    });

    expect(result).toContain('$getAutoincrement(field: "id"): number;');
    expect(result).toContain("$getAutoincrement(field: never): number;");
  });

  it("should still build the autoincrement client option from the same config", () => {
    const result = generater(dictYaml, undefined, "", true, undefined, [], {
      User: ["id"],
    });

    expect(result).toContain(
      `export type GassmaAutoincrementConfig = {\n  "User"?: "id" | "name" | ("id" | "name")[];\n};\n`,
    );
  });
});
