import { describe, expect, it } from "vitest";
import { buildEnvVarsLines } from "../../debug/sections/envVarsSection";
import { createStyler } from "../../debug/styles";

const plain = createStyler(false);

describe("buildEnvVarsLines", () => {
  it("should start with the heading and the two description lines", () => {
    const lines = buildEnvVarsLines({}, plain);

    expect(lines[0]).toBe("-- Environment variables --");
    expect(lines[1]).toBe(
      "When not set, the line is dimmed and no value is displayed.",
    );
    expect(lines[2]).toBe(
      "When set, the line is bold and the value is inside the `` backticks.",
    );
    expect(lines[3]).toBe("");
    expect(lines[4]).toBe("For general debugging");
  });

  it("should list the general debugging variables in the fixed order", () => {
    const lines = buildEnvVarsLines({}, plain);

    expect(lines.slice(5)).toEqual([
      "- CI:",
      "- DEBUG:",
      "- NODE_ENV:",
      "- NO_COLOR:",
      "- TERM:",
      "- NODE_TLS_REJECT_UNAUTHORIZED:",
      "- NO_PROXY:",
      "- http_proxy:",
      "- HTTP_PROXY:",
      "- https_proxy:",
      "- HTTPS_PROXY:",
    ]);
  });

  it("should show set variables with their value inside backticks", () => {
    const lines = buildEnvVarsLines({ TERM: "xterm-256color" }, plain);

    expect(lines).toContain("- TERM: `xterm-256color`");
  });

  it("should dim unset variables and bold set variables", () => {
    const styler = createStyler(true);
    const lines = buildEnvVarsLines({ TERM: "dumb" }, styler);

    expect(lines).toContain("\u001b[2m- CI:\u001b[22m");
    expect(lines).toContain("\u001b[1m- TERM: `dumb`\u001b[22m");
  });

  it("should treat an empty string value as unset", () => {
    const lines = buildEnvVarsLines({ DEBUG: "" }, plain);

    expect(lines).toContain("- DEBUG:");
    expect(lines).not.toContain("- DEBUG: ``");
  });
});
