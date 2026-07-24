import { describe, it, expect } from "vitest";
import { buildUpdateDataType } from "../../../../generate/typeGenerate/util/buildUpdateDataType";

describe("buildUpdateDataType", () => {
  it("should add NumberOperation only to number columns", () => {
    const result = buildUpdateDataType("GassmaUserUse", {
      id: ["number"],
      name: ["string"],
    });

    expect(result).toBe(
      'Partial<{ [K in keyof GassmaUserUse]: GassmaUserUse[K] | (K extends "id" ? Gassma.NumberOperation : never) }>',
    );
  });

  it("should strip the nullable marker from number column keys", () => {
    const result = buildUpdateDataType("GassmaUserUse", {
      id: ["number"],
      "age?": ["number"],
      name: ["string"],
    });

    expect(result).toContain('K extends "id" | "age"');
  });

  it("should treat addType unions containing number as number columns", () => {
    const result = buildUpdateDataType("GassmaUserUse", {
      "rating?": ["number", "string", "boolean"],
      name: ["string"],
    });

    expect(result).toContain('K extends "rating"');
  });

  it("should not treat the literal number-like string type as a number column", () => {
    const result = buildUpdateDataType("GassmaUserUse", {
      kind: ["{{number}}"],
      name: ["string"],
    });

    expect(result).toBe("Partial<GassmaUserUse>");
  });

  it("should collapse to plain Partial when there is no number column", () => {
    const result = buildUpdateDataType("GassmaUserUse", {
      name: ["string"],
      "flag?": ["boolean"],
    });

    expect(result).toBe("Partial<GassmaUserUse>");
  });

  it("should append SkipValue inside the mapped type when strict", () => {
    const result = buildUpdateDataType(
      "GassmaUserUse",
      { id: ["number"], name: ["string"] },
      true,
    );

    expect(result).toBe(
      'Partial<{ [K in keyof GassmaUserUse]: GassmaUserUse[K] | (K extends "id" ? Gassma.NumberOperation : never) | Gassma.SkipValue }>',
    );
  });

  it("should keep the mapped form for SkipValue even without number columns when strict", () => {
    const result = buildUpdateDataType(
      "GassmaUserUse",
      { name: ["string"] },
      true,
    );

    expect(result).toBe(
      "Partial<{ [K in keyof GassmaUserUse]: GassmaUserUse[K] | Gassma.SkipValue }>",
    );
  });
});
