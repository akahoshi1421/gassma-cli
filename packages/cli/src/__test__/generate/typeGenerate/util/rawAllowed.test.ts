import { describe, it, expect } from "vitest";
import { rawAllowedWrap } from "../../../../generate/typeGenerate/util/rawAllowed";

describe("rawAllowedWrap", () => {
  it("should wrap the type expression with Gassma.RawAllowed", () => {
    expect(rawAllowedWrap("GassmaUserUse")).toBe(
      "Gassma.RawAllowed<GassmaUserUse>",
    );
  });

  it("should wrap composite type expressions as-is", () => {
    expect(rawAllowedWrap('Omit<GassmaPostUse, "authorId">')).toBe(
      'Gassma.RawAllowed<Omit<GassmaPostUse, "authorId">>',
    );
  });
});
