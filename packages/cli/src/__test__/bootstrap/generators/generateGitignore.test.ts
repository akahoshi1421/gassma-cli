import { describe, expect, it } from "vitest";
import {
  generateGitignore,
  mergeGitignore,
} from "../../../bootstrap/generators/generateGitignore";

describe("generateGitignore", () => {
  it("should ignore clasp credentials and local files", () => {
    const lines = generateGitignore().split("\n");

    expect(lines).toContain(".clasp.json");
    expect(lines).toContain(".clasprc.json");
    expect(lines).toContain(".env");
    expect(lines).toContain("node_modules/");
  });

  it("should ignore dist except appsscript.json", () => {
    const lines = generateGitignore().split("\n");
    const distIndex = lines.indexOf("dist/*");
    const keepIndex = lines.indexOf("!dist/appsscript.json");

    expect(distIndex).toBeGreaterThanOrEqual(0);
    expect(keepIndex).toBeGreaterThan(distIndex);
  });

  it("should not ignore package-lock.json", () => {
    expect(generateGitignore()).not.toContain("package-lock.json");
  });

  it("should end with a newline", () => {
    expect(generateGitignore().endsWith("\n")).toBe(true);
  });
});

describe("mergeGitignore", () => {
  it("should append only missing entries", () => {
    const existing = "node_modules/\n.env\n";

    const merged = mergeGitignore(existing);
    const lines = merged.split("\n");

    expect(merged.startsWith("node_modules/\n.env\n")).toBe(true);
    expect(lines.filter((line) => line === "node_modules/")).toHaveLength(1);
    expect(lines.filter((line) => line === ".env")).toHaveLength(1);
    expect(lines).toContain(".clasp.json");
    expect(lines).toContain("dist/*");
    expect(lines).toContain("!dist/appsscript.json");
  });

  it("should return the content unchanged when everything is present", () => {
    const existing = generateGitignore();

    expect(mergeGitignore(existing)).toBe(existing);
  });

  it("should handle existing content without a trailing newline", () => {
    const merged = mergeGitignore("node_modules/");

    expect(merged).toContain("node_modules/\n");
    expect(merged).toContain(".clasp.json\n");
  });

  it("should recognize entries with surrounding whitespace", () => {
    const merged = mergeGitignore("  .clasp.json  \n");

    expect(
      merged.split("\n").filter((line) => line.trim() === ".clasp.json"),
    ).toHaveLength(1);
  });
});
