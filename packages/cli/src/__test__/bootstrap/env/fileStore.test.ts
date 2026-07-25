import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFsFileStore } from "../../../bootstrap/env/fileStore";

describe("createFsFileStore", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-store-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should report existence correctly", () => {
    const store = createFsFileStore();
    const filePath = path.join(tmpDir, "a.txt");

    expect(store.exists(filePath)).toBe(false);
    fs.writeFileSync(filePath, "x");
    expect(store.exists(filePath)).toBe(true);
  });

  it("should write and read back content", () => {
    const store = createFsFileStore();
    const filePath = path.join(tmpDir, "b.txt");

    store.write(filePath, "hello");

    expect(store.read(filePath)).toBe("hello");
  });

  it("should create parent directories on write", () => {
    const store = createFsFileStore();
    const filePath = path.join(tmpDir, "nested", "deep", "c.txt");

    store.write(filePath, "nested content");

    expect(fs.readFileSync(filePath, "utf-8")).toBe("nested content");
  });
});
