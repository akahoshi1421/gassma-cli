import { describe, it, expect } from "vitest";
import {
  skipUnion,
  skipOptionalWrap,
} from "../../../../generate/typeGenerate/util/skipUnion";

describe("skipUnion", () => {
  it("should return SkipValue union suffix when strict", () => {
    expect(skipUnion(true)).toBe(" | Gassma.SkipValue");
  });

  it("should return empty string when not strict", () => {
    expect(skipUnion(false)).toBe("");
    expect(skipUnion(undefined)).toBe("");
  });
});

describe("skipOptionalWrap", () => {
  it("should wrap type expression with SkipOptional when strict", () => {
    expect(skipOptionalWrap("GassmaUserUse", true)).toBe(
      "Gassma.SkipOptional<GassmaUserUse>",
    );
  });

  it("should return type expression as-is when not strict", () => {
    expect(skipOptionalWrap("GassmaUserUse", false)).toBe("GassmaUserUse");
    expect(skipOptionalWrap("GassmaUserUse", undefined)).toBe("GassmaUserUse");
  });
});
