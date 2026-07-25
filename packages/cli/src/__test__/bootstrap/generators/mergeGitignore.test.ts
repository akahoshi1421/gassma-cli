import { describe, expect, it } from "vitest";
import { mergeGitignore } from "../../../bootstrap/generators/mergeGitignore";

const TEMPLATE = [
  ".clasp.json",
  ".clasprc.json",
  ".env",
  "node_modules/",
  "dist/*",
  "!dist/appsscript.json",
  "",
].join("\n");

describe("mergeGitignore", () => {
  it("should append only missing template entries", () => {
    const existing = "node_modules/\n.env\n";

    const merged = mergeGitignore(TEMPLATE, existing);
    const lines = merged.split("\n");

    expect(merged.startsWith("node_modules/\n.env\n")).toBe(true);
    expect(lines.filter((line) => line === "node_modules/")).toHaveLength(1);
    expect(lines.filter((line) => line === ".env")).toHaveLength(1);
    expect(lines).toContain(".clasp.json");
    expect(lines).toContain("dist/*");
    expect(lines).toContain("!dist/appsscript.json");
  });

  it("should preserve the template entry order when appending", () => {
    const merged = mergeGitignore(TEMPLATE, "node_modules/\n");

    expect(merged).toBe(
      "node_modules/\n.clasp.json\n.clasprc.json\n.env\ndist/*\n!dist/appsscript.json\n",
    );
  });

  it("should return the content unchanged when everything is present", () => {
    expect(mergeGitignore(TEMPLATE, TEMPLATE)).toBe(TEMPLATE);
  });

  it("should handle existing content without a trailing newline", () => {
    const merged = mergeGitignore(TEMPLATE, "node_modules/");

    expect(merged).toContain("node_modules/\n");
    expect(merged).toContain(".clasp.json\n");
  });

  it("should recognize entries with surrounding whitespace", () => {
    const merged = mergeGitignore(".clasp.json\n", "  .clasp.json  \n");

    expect(
      merged.split("\n").filter((line) => line.trim() === ".clasp.json"),
    ).toHaveLength(1);
  });

  it("should not append blank template lines", () => {
    const merged = mergeGitignore(".env\n\n\n", ".env\n");

    expect(merged).toBe(".env\n");
  });
});
