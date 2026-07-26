import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createDirectoryOps,
  inspectDirectory,
  resolveTargetDirectory,
} from "../../../bootstrap/env/targetDirectory";

describe("resolveTargetDirectory", () => {
  it("should resolve a relative name against the cwd", () => {
    expect(resolveTargetDirectory("/home/user", "my-app")).toBe(
      path.resolve("/home/user", "my-app"),
    );
  });

  it("should resolve '.' to the cwd itself", () => {
    expect(resolveTargetDirectory("/home/user", ".")).toBe(
      path.resolve("/home/user"),
    );
  });

  it("should keep an absolute path as is", () => {
    expect(resolveTargetDirectory("/home/user", "/opt/app")).toBe(
      path.resolve("/opt/app"),
    );
  });

  it("should treat a blank input as the cwd", () => {
    expect(resolveTargetDirectory("/home/user", "  ")).toBe(
      path.resolve("/home/user"),
    );
  });
});

describe("inspectDirectory", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-target-dir-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should report a missing path", () => {
    expect(inspectDirectory(path.join(tmpDir, "nope"))).toBe("missing");
  });

  it("should report an empty directory", () => {
    expect(inspectDirectory(tmpDir)).toBe("empty");
  });

  it("should report a non-empty directory", () => {
    fs.writeFileSync(path.join(tmpDir, "a.txt"), "a");
    expect(inspectDirectory(tmpDir)).toBe("nonEmpty");
  });

  it("should report a directory containing only dotfiles as non-empty", () => {
    fs.writeFileSync(path.join(tmpDir, ".env"), "");
    expect(inspectDirectory(tmpDir)).toBe("nonEmpty");
  });

  it("should report a file path as a file", () => {
    const filePath = path.join(tmpDir, "file.txt");
    fs.writeFileSync(filePath, "x");
    expect(inspectDirectory(filePath)).toBe("file");
  });
});

describe("createDirectoryOps", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-target-ops-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should create nested directories with ensure", () => {
    const target = path.join(tmpDir, "a", "b");

    createDirectoryOps().ensure(target);

    expect(fs.statSync(target).isDirectory()).toBe(true);
  });

  it("should change the process cwd with changeTo", () => {
    const original = process.cwd();
    try {
      createDirectoryOps().changeTo(tmpDir);
      expect(process.cwd()).toBe(fs.realpathSync(tmpDir));
    } finally {
      process.chdir(original);
    }
  });
});
