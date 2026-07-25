import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  buildConfigLine,
  collectConfigStatus,
} from "../../debug/sections/configSection";

describe("collectConfigStatus", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    process.chdir(fs.mkdtempSync(path.join(os.tmpdir(), "gassma-debug-conf-")));
    tmpDir = process.cwd();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should report loaded with the config file path", () => {
    fs.writeFileSync(
      path.join(tmpDir, "gassma.config.ts"),
      `export default { schema: "gassma" };`,
    );

    const status = collectConfigStatus(undefined);

    expect(status).toEqual({
      kind: "loaded",
      filePath: path.join(tmpDir, "gassma.config.ts"),
    });
  });

  it("should report notFound when no config file exists", () => {
    expect(collectConfigStatus(undefined)).toEqual({ kind: "notFound" });
  });

  it("should report a one-line error when the config cannot be loaded", () => {
    fs.writeFileSync(
      path.join(tmpDir, "gassma.config.ts"),
      `export default { schema: 123 };`,
    );

    const status = collectConfigStatus(undefined);

    expect(status.kind).toBe("error");
    if (status.kind === "error") {
      expect(status.message).not.toContain("\n");
      expect(status.message).toContain("GASsmaConfigLoadError");
    }
  });

  it("should report an error when --config points to a missing file", () => {
    const status = collectConfigStatus("missing.config.ts");

    expect(status.kind).toBe("error");
  });
});

describe("buildConfigLine", () => {
  it("should describe the searched locations when no config is found", () => {
    expect(buildConfigLine({ kind: "notFound" })).toBe(
      "No config file found (searched: gassma.config.{js,ts,mjs,cjs,mts,cts}, " +
        ".config/gassma.{js,ts,mjs,cjs,mts,cts})",
    );
  });

  it("should describe a load error in one line", () => {
    expect(buildConfigLine({ kind: "error", message: "boom" })).toBe(
      "Failed to load config: boom",
    );
  });
});
