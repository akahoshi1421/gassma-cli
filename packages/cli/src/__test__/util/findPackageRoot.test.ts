import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findPackageRoot } from "../../util/findPackageRoot";

describe("findPackageRoot", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-package-root-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const writePackageJson = (
    dir: string,
    content: Record<string, unknown> | string,
  ): void => {
    fs.mkdirSync(dir, { recursive: true });
    const body =
      typeof content === "string" ? content : JSON.stringify(content);
    fs.writeFileSync(path.join(dir, "package.json"), body);
  };

  const makeStartDir = (...segments: string[]): string => {
    const startDir = path.join(...segments);
    fs.mkdirSync(startDir, { recursive: true });
    return startDir;
  };

  it("should resolve the package root from a bundled dist layout", () => {
    writePackageJson(tmpDir, { name: "gassma", version: "9.9.9" });
    const startDir = makeStartDir(tmpDir, "dist");

    expect(findPackageRoot(startDir)).toEqual({
      dir: tmpDir,
      version: "9.9.9",
    });
  });

  it("should resolve the package root from a nested src layout", () => {
    writePackageJson(tmpDir, { name: "gassma", version: "1.2.3" });
    const startDir = makeStartDir(tmpDir, "src", "bootstrap", "env");

    expect(findPackageRoot(startDir)).toEqual({
      dir: tmpDir,
      version: "1.2.3",
    });
  });

  it("should return the package root itself as a start dir", () => {
    writePackageJson(tmpDir, { name: "gassma", version: "2.0.0" });

    expect(findPackageRoot(tmpDir)).toEqual({ dir: tmpDir, version: "2.0.0" });
  });

  it("should skip package.json files that are not the gassma package", () => {
    writePackageJson(tmpDir, { name: "gassma", version: "7.7.7" });
    const nested = path.join(tmpDir, "packages", "other");
    writePackageJson(nested, { name: "gassma-cli-monorepo" });
    const startDir = makeStartDir(nested, "dist");

    expect(findPackageRoot(startDir)).toEqual({
      dir: tmpDir,
      version: "7.7.7",
    });
  });

  it("should skip a gassma package.json without a version string", () => {
    writePackageJson(tmpDir, { name: "gassma", version: "3.3.3" });
    const nested = path.join(tmpDir, "nested");
    writePackageJson(nested, { name: "gassma" });
    const startDir = makeStartDir(nested, "dist");

    expect(findPackageRoot(startDir)).toEqual({
      dir: tmpDir,
      version: "3.3.3",
    });
  });

  it("should skip an unparsable package.json and keep walking up", () => {
    writePackageJson(tmpDir, { name: "gassma", version: "5.5.5" });
    const nested = path.join(tmpDir, "nested");
    writePackageJson(nested, "{ broken");
    const startDir = makeStartDir(nested, "dist");

    expect(findPackageRoot(startDir)).toEqual({
      dir: tmpDir,
      version: "5.5.5",
    });
  });

  it("should return undefined when no gassma package.json exists up the tree", () => {
    const startDir = makeStartDir(tmpDir, "dist");

    expect(findPackageRoot(startDir)).toBeUndefined();
  });

  it("should resolve the real gassma package root from this test file", () => {
    const found = findPackageRoot(__dirname);
    const expectedRoot = path.resolve(__dirname, "../../..");

    expect(found?.dir).toBe(expectedRoot);
  });
});
