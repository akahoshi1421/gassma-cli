import { describe, expect, it } from "vitest";
import {
  buildCiLines,
  buildInteractiveLines,
  isInteractive,
} from "../../debug/sections/runtimeSection";
import { createStyler } from "../../debug/styles";

const plain = createStyler(false);

describe("isInteractive", () => {
  it("should be true for a TTY stdin with a normal TERM", () => {
    expect(isInteractive(true, "xterm-256color")).toBe(true);
  });

  it("should be true for a TTY stdin without TERM", () => {
    expect(isInteractive(true, undefined)).toBe(true);
  });

  it("should be false when stdin is not a TTY", () => {
    expect(isInteractive(false, "xterm-256color")).toBe(false);
  });

  it("should be false when TERM is dumb", () => {
    expect(isInteractive(true, "dumb")).toBe(false);
  });
});

describe("buildInteractiveLines", () => {
  it("should render the heading and the boolean value", () => {
    expect(buildInteractiveLines(true, plain)).toEqual([
      "-- Terminal is interactive? --",
      "true",
    ]);
    expect(buildInteractiveLines(false, plain)).toEqual([
      "-- Terminal is interactive? --",
      "false",
    ]);
  });
});

describe("buildCiLines", () => {
  it("should render the heading and the boolean value", () => {
    expect(buildCiLines(false, plain)).toEqual(["-- CI detected? --", "false"]);
    expect(buildCiLines(true, plain)).toEqual(["-- CI detected? --", "true"]);
  });
});
