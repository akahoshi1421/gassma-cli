import { describe, it, expect } from "vitest";
import { getOneGassmaUpdateData } from "../../../generate/typeGenerate/gassmaUpdateData/oneGassmaUpdateData";

describe("getOneGassmaUpdateData", () => {
  const userContent: Record<string, unknown[]> = {
    id: ["number"],
    "age?": ["number"],
    name: ["string"],
  };

  it("should generate UpdateData with NumberOperation only on number columns", () => {
    const result = getOneGassmaUpdateData("", "User", userContent);

    expect(result).toContain("export type GassmaUserUpdateData");
    expect(result).toContain(
      'data: Partial<{ [K in keyof GassmaUserUse]: GassmaUserUse[K] | (K extends "id" | "age" ? Gassma.NumberOperation : never) }>;',
    );
  });

  it("should treat addType unions containing number as number columns", () => {
    const result = getOneGassmaUpdateData("", "User", {
      "rating?": ["number", "string", "boolean"],
      name: ["string"],
    });

    expect(result).toContain(
      '(K extends "rating" ? Gassma.NumberOperation : never)',
    );
  });

  it("should not add NumberOperation when there is no number column", () => {
    const result = getOneGassmaUpdateData("", "User", {
      name: ["string"],
      "flag?": ["boolean"],
    });

    expect(result).toContain("data: Partial<GassmaUserUse>;");
    expect(result).not.toContain("NumberOperation");
  });

  it("should not add nested writes (core updateManyFunc handles scalars only)", () => {
    const result = getOneGassmaUpdateData("", "User", userContent);

    expect(result).not.toContain('"posts"?:');
    expect(result).not.toContain("create?:");
    expect(result).not.toContain("connect?:");
  });

  it("should include limit property", () => {
    const result = getOneGassmaUpdateData("", "User", userContent);

    expect(result).toContain("limit?: number;");
  });
});
