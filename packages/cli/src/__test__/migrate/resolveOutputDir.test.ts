import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolveOutputDir } from "../../migrate/resolveOutputDir";

describe("resolveOutputDir", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-migrate-out-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should prefer the --output option over .clasp.json", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".clasp.json"),
      JSON.stringify({ rootDir: "./dist" }),
    );
    expect(resolveOutputDir("./custom", tmpDir)).toBe("./custom");
  });

  it("should fall back to rootDir in .clasp.json", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".clasp.json"),
      JSON.stringify({ scriptId: "abc", rootDir: "./dist" }),
    );
    expect(resolveOutputDir(undefined, tmpDir)).toBe("./dist");
  });

  it("should throw a clear error when neither is available", () => {
    expect(() => resolveOutputDir(undefined, tmpDir)).toThrow("--output");
  });

  it("should show the example on a subcommand that exists", () => {
    expect(() => resolveOutputDir(undefined, tmpDir)).toThrow(
      "npx gassma migrate dev --output ./dist",
    );
  });

  it("should throw when .clasp.json has no rootDir", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".clasp.json"),
      JSON.stringify({ scriptId: "abc" }),
    );
    expect(() => resolveOutputDir(undefined, tmpDir)).toThrow("--output");
  });

  it("should throw when .clasp.json cannot be parsed", () => {
    fs.writeFileSync(path.join(tmpDir, ".clasp.json"), "{ broken");
    expect(() => resolveOutputDir(undefined, tmpDir)).toThrow("--output");
  });
});
