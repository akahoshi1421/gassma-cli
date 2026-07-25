import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createDebugFs } from "../../debug/env/debugFs";

describe("createDebugFs", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-debug-fs-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should report existence and read text", () => {
    const filePath = path.join(tmpDir, "a.txt");
    fs.writeFileSync(filePath, "hello");
    const debugFs = createDebugFs();

    expect(debugFs.exists(filePath)).toBe(true);
    expect(debugFs.exists(path.join(tmpDir, "missing.txt"))).toBe(false);
    expect(debugFs.readText(filePath)).toBe("hello");
  });

  it("should return the mtime in milliseconds for an existing file", () => {
    const filePath = path.join(tmpDir, "a.txt");
    fs.writeFileSync(filePath, "hello");
    const debugFs = createDebugFs();

    expect(debugFs.mtimeMs(filePath)).toBe(fs.statSync(filePath).mtimeMs);
  });

  it("should return undefined mtime for a missing file", () => {
    const debugFs = createDebugFs();

    expect(debugFs.mtimeMs(path.join(tmpDir, "missing.txt"))).toBeUndefined();
  });
});
