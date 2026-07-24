import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { findConfigFile } from "../../config/findConfigFile";

describe("findConfigFile", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-find-config-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const touch = (relativePath: string) => {
    const fullPath = path.join(tmpDir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, "export default {};");
    return fullPath;
  };

  it("should return undefined when no config file exists", () => {
    expect(findConfigFile(tmpDir)).toBeUndefined();
  });

  it.each(["js", "ts", "mjs", "cjs", "mts", "cts"])(
    "should find gassma.config.%s",
    (ext) => {
      const expected = touch(`gassma.config.${ext}`);
      expect(findConfigFile(tmpDir)).toBe(expected);
    },
  );

  it("should prefer .js over all other extensions", () => {
    ["js", "ts", "mjs", "cjs", "mts", "cts"].forEach((ext) => {
      touch(`gassma.config.${ext}`);
    });
    expect(findConfigFile(tmpDir)).toBe(path.join(tmpDir, "gassma.config.js"));
  });

  it("should prefer .ts over .mjs", () => {
    touch("gassma.config.mjs");
    const expected = touch("gassma.config.ts");
    expect(findConfigFile(tmpDir)).toBe(expected);
  });

  it("should prefer .mjs over .cjs", () => {
    touch("gassma.config.cjs");
    const expected = touch("gassma.config.mjs");
    expect(findConfigFile(tmpDir)).toBe(expected);
  });

  it("should prefer .mts over .cts", () => {
    touch("gassma.config.cts");
    const expected = touch("gassma.config.mts");
    expect(findConfigFile(tmpDir)).toBe(expected);
  });

  it.each(["js", "ts", "mjs", "cjs", "mts", "cts"])(
    "should find .config/gassma.%s when no root config exists",
    (ext) => {
      const expected = touch(`.config/gassma.${ext}`);
      expect(findConfigFile(tmpDir)).toBe(expected);
    },
  );

  it("should prefer root gassma.config.cts over .config/gassma.js", () => {
    touch(".config/gassma.js");
    const expected = touch("gassma.config.cts");
    expect(findConfigFile(tmpDir)).toBe(expected);
  });

  it("should prefer .config/gassma.js over .config/gassma.ts", () => {
    touch(".config/gassma.ts");
    const expected = touch(".config/gassma.js");
    expect(findConfigFile(tmpDir)).toBe(expected);
  });

  it("should not match .config/gassma.config.ts", () => {
    touch(".config/gassma.config.ts");
    expect(findConfigFile(tmpDir)).toBeUndefined();
  });
});
