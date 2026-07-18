import fs from "fs";
import os from "os";
import path from "path";
import type { MockInstance } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../../config/loadConfig";
import { GassmaConfigLoadError } from "../../error/mainError";

describe("loadConfig error handling", () => {
  let tmpDir: string;
  let originalCwd: string;
  let warnSpy: MockInstance<typeof console.warn>;

  beforeEach(() => {
    originalCwd = process.cwd();
    process.chdir(fs.mkdtempSync(path.join(os.tmpdir(), "gassma-config-err-")));
    tmpDir = process.cwd();
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const writeConfig = (content: string): string => {
    const configPath = path.join(tmpDir, "gassma.config.ts");
    fs.writeFileSync(configPath, content);
    return configPath;
  };

  const captureLoadError = (configPath?: string): GassmaConfigLoadError => {
    try {
      loadConfig(configPath);
    } catch (error) {
      if (error instanceof GassmaConfigLoadError) return error;
      throw new Error(`expected GassmaConfigLoadError, got: ${String(error)}`);
    }
    throw new Error("expected loadConfig to throw");
  };

  describe("broken config files", () => {
    it("should throw GassmaConfigLoadError with the file path for a syntax error", () => {
      const configPath = writeConfig("export default { schema: ");

      const error = captureLoadError();
      expect(error.message).toContain(
        "GASsmaConfigLoadError: Failed to load config file at",
      );
      expect(error.message).toContain(configPath);
    });

    it("should include the original error message for a runtime error", () => {
      const configPath = writeConfig(
        'throw new Error("boom in config");\nexport default {};',
      );

      const error = captureLoadError();
      expect(error.message).toContain(configPath);
      expect(error.message).toContain("boom in config");
    });

    it("should throw GassmaConfigLoadError for a broken explicit config path", () => {
      const dir = path.join(tmpDir, "conf");
      fs.mkdirSync(dir, { recursive: true });
      const configPath = path.join(dir, "custom.config.ts");
      fs.writeFileSync(configPath, "export default { schema: ");

      const error = captureLoadError("conf/custom.config.ts");
      expect(error.message).toContain(configPath);
    });
  });

  describe("invalid export shapes", () => {
    it("should throw when the default export is a string", () => {
      const configPath = writeConfig('export default "not an object";');

      const error = captureLoadError();
      expect(error.message).toContain(configPath);
      expect(error.message).toContain(
        "Expected the config file to export a config object",
      );
      expect(error.message).toContain("a string");
    });

    it("should throw when the default export is null", () => {
      writeConfig("export default null;");

      const error = captureLoadError();
      expect(error.message).toContain(
        "Expected the config file to export a config object",
      );
      expect(error.message).toContain("null");
    });

    it("should throw when schema is not a string", () => {
      writeConfig("export default { schema: 123 };");

      const error = captureLoadError();
      expect(error.message).toContain(
        "Expected `schema` to be a string, but received a number",
      );
    });

    it("should throw when datasource is not an object", () => {
      writeConfig('export default { datasource: "https://example.com" };');

      const error = captureLoadError();
      expect(error.message).toContain(
        "Expected `datasource` to be an object, but received a string",
      );
    });

    it("should throw when datasource.url is not a string", () => {
      writeConfig("export default { datasource: { url: 123 } };");

      const error = captureLoadError();
      expect(error.message).toContain(
        "Expected `datasource.url` to be a string, but received a number",
      );
    });
  });

  describe("unknown keys", () => {
    it("should warn about an unknown top-level key and still load the config", () => {
      writeConfig(
        'export default { schema: "gassma/a.prisma", schemna: "typo" };',
      );

      const loaded = loadConfig();

      expect(loaded?.config).toEqual({ schema: "gassma/a.prisma" });
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Unknown property `schemna`"),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("gassma.config.ts"),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Known properties are: schema, datasource"),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("It will be ignored"),
      );
    });

    it("should warn about an unknown datasource key and still load the config", () => {
      writeConfig(
        'export default { datasource: { url: "https://example.com", urls: "typo" } };',
      );

      const loaded = loadConfig();

      expect(loaded?.config).toEqual({
        datasource: { url: "https://example.com" },
      });
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Unknown property `urls`"),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("`datasource`"),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Known properties are: url"),
      );
    });
  });

  describe("valid configs", () => {
    it("should not warn for a fully valid config", () => {
      const configPath = writeConfig(
        'export default { schema: "gassma/a.prisma", datasource: { url: "https://example.com" } };',
      );

      const loaded = loadConfig();

      expect(loaded?.config).toEqual({
        schema: "gassma/a.prisma",
        datasource: { url: "https://example.com" },
      });
      expect(loaded?.filePath).toBe(configPath);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("should load a config exported via named exports without warning", () => {
      writeConfig('export const schema = "gassma/a.prisma";');

      const loaded = loadConfig();

      expect(loaded?.config).toEqual({ schema: "gassma/a.prisma" });
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });
});
