import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  loadBootstrapTemplates,
  readTemplate,
} from "../../../bootstrap/env/readTemplate";

describe("readTemplate", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-template-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should read the named template above the given start dir", () => {
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

    expect(readTemplate(".gitignore.example", startDir)).toBe("custom\n");
  });

  it("should throw when no gassma package root exists up the tree", () => {
    expect(() => readTemplate(".gitignore.example", tmpDir)).toThrow(
      /installation/,
    );
  });

  it("should throw when the template file is missing from the package", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "gassma", version: "1.0.0" }),
    );

    expect(() => readTemplate("tsconfig.json.example", tmpDir)).toThrow(
      /tsconfig.json.example/,
    );
  });
});

describe("loadBootstrapTemplates", () => {
  it("should load every bundled template", () => {
    const templates = loadBootstrapTemplates();

    expect(templates.gitignore).toContain(".clasp.json");
    expect(templates.tsconfig).toContain("google-apps-script");
    expect(templates.packageJson).toContain('"gassma"');
    expect(templates.esbuild.export).toContain("gasEsbuildPlugin");
    expect(templates.esbuild.global).toContain("GasPlugin");
    expect(templates.sampleIndex.export).toContain("export const main");
    expect(templates.sampleIndex.global).toContain("global.main = main;");
  });
});
