import { describe, expect, it } from "vitest";
import { generateStubs } from "../generateStubs";

describe("generateStubs", () => {
  it("should generate a top-level function stub for each export name", () => {
    const result = generateStubs(["foo", "bar"], "__gassmaExports");

    expect(result).toBe(
      [
        "function foo() { return __gassmaExports.foo.apply(this, arguments); }",
        "function bar() { return __gassmaExports.bar.apply(this, arguments); }",
      ].join("\n"),
    );
  });

  it("should reference the given global name", () => {
    const result = generateStubs(["foo"], "__myBundle");

    expect(result).toBe(
      "function foo() { return __myBundle.foo.apply(this, arguments); }",
    );
  });

  it("should not generate a stub for the default export", () => {
    const result = generateStubs(["default", "foo"], "__gassmaExports");

    expect(result).toBe(
      "function foo() { return __gassmaExports.foo.apply(this, arguments); }",
    );
  });

  it("should skip names that cannot be top-level function names", () => {
    const result = generateStubs(
      ["not-an-identifier", "class", "valid"],
      "__gassmaExports",
    );

    expect(result).toBe(
      "function valid() { return __gassmaExports.valid.apply(this, arguments); }",
    );
  });

  it("should return an empty string when there is no stub target", () => {
    expect(generateStubs([], "__gassmaExports")).toBe("");
    expect(generateStubs(["default"], "__gassmaExports")).toBe("");
  });
});
