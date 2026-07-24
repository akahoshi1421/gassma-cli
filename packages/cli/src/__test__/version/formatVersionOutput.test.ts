import { describe, expect, it } from "vitest";
import { formatVersionOutput } from "../../version/formatVersionOutput";

describe("formatVersionOutput", () => {
  it("should return plain text without json flag", () => {
    expect(formatVersionOutput("1.1.0", false)).toBe("gassma v1.1.0");
  });

  it("should return JSON with gassma key when json flag is set", () => {
    const output = formatVersionOutput("1.1.0", true);

    expect(JSON.parse(output)).toEqual({ gassma: "1.1.0" });
  });

  it("should reflect the given version in JSON output", () => {
    const output = formatVersionOutput("2.3.4", true);

    expect(JSON.parse(output).gassma).toBe("2.3.4");
  });
});
