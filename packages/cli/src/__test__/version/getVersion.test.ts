import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findGassmaVersion, getVersion } from "../../version/getVersion";

describe("getVersion", () => {
  it("should return version string from package.json", () => {
    const version = getVersion();

    expect(typeof version).toBe("string");
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("should match package.json version", () => {
    const packageJsonPath = path.resolve(__dirname, "../../../package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const version = getVersion();

    expect(version).toBe(packageJson.version);
  });
});

describe("findGassmaVersion", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-version-"));
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

  it("should resolve the version from a bundled dist layout", () => {
    writePackageJson(tmpDir, { name: "gassma", version: "9.9.9" });
    const startDir = makeStartDir(tmpDir, "dist");

    expect(findGassmaVersion(startDir)).toBe("9.9.9");
  });

  it("should resolve the version from an unbundled dist layout", () => {
    writePackageJson(tmpDir, { name: "gassma", version: "1.2.3" });
    const startDir = makeStartDir(tmpDir, "dist", "version");

    expect(findGassmaVersion(startDir)).toBe("1.2.3");
  });

  it("should resolve the version from the src layout", () => {
    writePackageJson(tmpDir, { name: "gassma", version: "4.5.6" });
    const startDir = makeStartDir(tmpDir, "src", "version");

    expect(findGassmaVersion(startDir)).toBe("4.5.6");
  });

  it("should skip package.json files that are not the gassma package", () => {
    writePackageJson(tmpDir, { name: "gassma", version: "7.7.7" });
    const nested = path.join(tmpDir, "packages", "other");
    writePackageJson(nested, { name: "gassma-cli-monorepo" });
    const startDir = makeStartDir(nested, "dist");

    expect(findGassmaVersion(startDir)).toBe("7.7.7");
  });

  it("should skip a gassma package.json without a version string", () => {
    writePackageJson(tmpDir, { name: "gassma", version: "3.3.3" });
    const nested = path.join(tmpDir, "nested");
    writePackageJson(nested, { name: "gassma" });
    const startDir = makeStartDir(nested, "dist");

    expect(findGassmaVersion(startDir)).toBe("3.3.3");
  });

  it("should skip an unparsable package.json and keep walking up", () => {
    writePackageJson(tmpDir, { name: "gassma", version: "5.5.5" });
    const nested = path.join(tmpDir, "nested");
    writePackageJson(nested, "{ broken");
    const startDir = makeStartDir(nested, "dist");

    expect(findGassmaVersion(startDir)).toBe("5.5.5");
  });

  it("should throw when no gassma package.json exists up the tree", () => {
    const startDir = makeStartDir(tmpDir, "dist");

    expect(() => findGassmaVersion(startDir)).toThrow(/gassma/);
  });
});
