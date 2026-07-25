import { describe, expect, it } from "vitest";
import { createStyler, resolveColorEnabled } from "../../debug/styles";

describe("createStyler", () => {
  it("should wrap headings with underline codes when enabled", () => {
    const styler = createStyler(true);
    expect(styler.heading("-- X --")).toBe("\u001b[4m-- X --\u001b[24m");
  });

  it("should wrap dim text with dim codes when enabled", () => {
    const styler = createStyler(true);
    expect(styler.dim("- CI:")).toBe("\u001b[2m- CI:\u001b[22m");
  });

  it("should wrap bold text with bold codes when enabled", () => {
    const styler = createStyler(true);
    expect(styler.bold("- TERM: `x`")).toBe("\u001b[1m- TERM: `x`\u001b[22m");
  });

  it("should return plain text when disabled", () => {
    const styler = createStyler(false);
    expect(styler.heading("-- X --")).toBe("-- X --");
    expect(styler.dim("- CI:")).toBe("- CI:");
    expect(styler.bold("- TERM:")).toBe("- TERM:");
  });
});

describe("resolveColorEnabled", () => {
  it("should enable color on a TTY without NO_COLOR", () => {
    expect(resolveColorEnabled({}, true)).toBe(true);
  });

  it("should disable color when NO_COLOR is set", () => {
    expect(resolveColorEnabled({ NO_COLOR: "1" }, true)).toBe(false);
  });

  it("should disable color when NO_COLOR is set to an empty string", () => {
    expect(resolveColorEnabled({ NO_COLOR: "" }, true)).toBe(false);
  });

  it("should disable color when stdout is not a TTY", () => {
    expect(resolveColorEnabled({}, false)).toBe(false);
  });
});
