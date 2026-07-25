import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readGitignoreTemplate } from "../../../bootstrap/env/readGitignoreTemplate";

const EXPECTED_TEMPLATE = [
  ".clasp.json",
  ".clasprc.json",
  ".env",
  "node_modules/",
  "dist/*",
  "!dist/appsscript.json",
  "",
].join("\n");

describe("readGitignoreTemplate", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-gitignore-tpl-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should return the bundled template content byte for byte", () => {
    expect(readGitignoreTemplate()).toBe(EXPECTED_TEMPLATE);
  });

  it("should read the template above the given start dir", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "gassma", version: "1.0.0" }),
    );
    fs.mkdirSync(path.join(tmpDir, "templates"));
    fs.writeFileSync(
      path.join(tmpDir, "templates", ".gitignore.example"),
      "custom\n",
    );
    const startDir = path.join(tmpDir, "dist");
    fs.mkdirSync(startDir);

    expect(readGitignoreTemplate(startDir)).toBe("custom\n");
  });

  it("should throw when no gassma package root exists up the tree", () => {
    expect(() => readGitignoreTemplate(tmpDir)).toThrow(/installation/);
  });

  it("should throw when the template file is missing from the package", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "gassma", version: "1.0.0" }),
    );

    expect(() => readGitignoreTemplate(tmpDir)).toThrow(/.gitignore.example/);
  });
});
