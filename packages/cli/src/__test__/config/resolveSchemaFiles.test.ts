import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { resolveSchemaFiles } from "../../config/resolveSchemaFiles";
import { ConfigFileNotFoundError } from "../../error/mainError";

describe("resolveSchemaFiles", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    process.chdir(fs.mkdtempSync(path.join(os.tmpdir(), "gassma-resolve-")));
    tmpDir = process.cwd();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe("--schema option (highest priority)", () => {
    it("should resolve from --schema option", () => {
      const dir = path.join(tmpDir, "gassma");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "test.prisma"), "content");

      const files = resolveSchemaFiles({ schema: "gassma/test.prisma" });
      expect(files).toHaveLength(1);
      expect(files[0].displayName).toBe("test.prisma");
    });

    it("should throw if --schema file not found", () => {
      expect(() =>
        resolveSchemaFiles({ schema: "gassma/notfound.prisma" }),
      ).toThrow("Schema file not found");
    });
  });

  describe("gassma.config.ts (second priority)", () => {
    it("should resolve from gassma.config.ts schema path", () => {
      const dir = path.join(tmpDir, "custom");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "schema.prisma"), "content");
      fs.writeFileSync(
        path.join(tmpDir, "gassma.config.ts"),
        `export default { schema: "custom/schema.prisma" };`,
      );

      const files = resolveSchemaFiles({});
      expect(files).toHaveLength(1);
      expect(files[0].filePath).toBe(
        path.join(tmpDir, "custom", "schema.prisma"),
      );
    });

    it("should resolve directory from gassma.config.ts", () => {
      const dir = path.join(tmpDir, "custom");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "a.prisma"), "content");
      fs.writeFileSync(path.join(dir, "b.prisma"), "content");
      fs.writeFileSync(
        path.join(tmpDir, "gassma.config.ts"),
        `export default { schema: "custom" };`,
      );

      const files = resolveSchemaFiles({});
      expect(files).toHaveLength(2);
    });

    it("--schema should override gassma.config.ts", () => {
      const dir = path.join(tmpDir, "gassma");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "override.prisma"), "content");
      fs.writeFileSync(
        path.join(tmpDir, "gassma.config.ts"),
        `export default { schema: "other/schema.prisma" };`,
      );

      const files = resolveSchemaFiles({ schema: "gassma/override.prisma" });
      expect(files).toHaveLength(1);
      expect(files[0].displayName).toBe("override.prisma");
    });
  });

  describe("--config option", () => {
    it("should resolve a relative schema file against the config file directory", () => {
      const confDir = path.join(tmpDir, "conf");
      fs.mkdirSync(path.join(confDir, "schemas"), { recursive: true });
      fs.writeFileSync(path.join(confDir, "schemas", "main.prisma"), "content");
      fs.writeFileSync(
        path.join(confDir, "custom.config.ts"),
        `export default { schema: "schemas/main.prisma" };`,
      );

      const files = resolveSchemaFiles({ config: "conf/custom.config.ts" });
      expect(files).toHaveLength(1);
      expect(files[0].filePath).toBe(
        path.join(confDir, "schemas", "main.prisma"),
      );
    });

    it("should resolve a relative schema directory against the config file directory", () => {
      const confDir = path.join(tmpDir, "conf");
      fs.mkdirSync(path.join(confDir, "schemas"), { recursive: true });
      fs.writeFileSync(path.join(confDir, "schemas", "a.prisma"), "content");
      fs.writeFileSync(path.join(confDir, "schemas", "b.prisma"), "content");
      fs.writeFileSync(
        path.join(confDir, "custom.config.ts"),
        `export default { schema: "schemas" };`,
      );

      const files = resolveSchemaFiles({ config: "conf/custom.config.ts" });
      expect(files).toHaveLength(2);
    });

    it("should use an absolute schema path in the config as is", () => {
      const schemaDir = path.join(tmpDir, "elsewhere");
      fs.mkdirSync(schemaDir, { recursive: true });
      fs.writeFileSync(path.join(schemaDir, "schema.prisma"), "content");
      const confDir = path.join(tmpDir, "conf");
      fs.mkdirSync(confDir, { recursive: true });
      fs.writeFileSync(
        path.join(confDir, "custom.config.ts"),
        `export default { schema: ${JSON.stringify(schemaDir)} };`,
      );

      const files = resolveSchemaFiles({ config: "conf/custom.config.ts" });
      expect(files).toHaveLength(1);
      expect(files[0].filePath).toBe(path.join(schemaDir, "schema.prisma"));
    });

    it("--schema should override the schema in --config", () => {
      const dir = path.join(tmpDir, "gassma");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "override.prisma"), "content");
      fs.writeFileSync(
        path.join(tmpDir, "custom.config.ts"),
        `export default { schema: "other/schema.prisma" };`,
      );

      const files = resolveSchemaFiles({
        schema: "gassma/override.prisma",
        config: "custom.config.ts",
      });
      expect(files).toHaveLength(1);
      expect(files[0].displayName).toBe("override.prisma");
    });

    it("should throw ConfigFileNotFoundError when --config does not exist", () => {
      expect(() =>
        resolveSchemaFiles({ config: "conf/missing.config.ts" }),
      ).toThrow(ConfigFileNotFoundError);
    });

    it("should throw for a missing --config even when --schema is given", () => {
      const dir = path.join(tmpDir, "gassma");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "test.prisma"), "content");

      expect(() =>
        resolveSchemaFiles({
          schema: "gassma/test.prisma",
          config: "conf/missing.config.ts",
        }),
      ).toThrow(ConfigFileNotFoundError);
    });
  });

  describe("default ./gassma directory (lowest priority)", () => {
    it("should resolve from default gassma/ directory", () => {
      const dir = path.join(tmpDir, "gassma");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "schema.prisma"), "content");

      const files = resolveSchemaFiles({});
      expect(files).toHaveLength(1);
    });

    it("should throw if gassma/ directory not found", () => {
      expect(() => resolveSchemaFiles({})).toThrow("directory not found");
    });

    it("should throw if no .prisma files found", () => {
      const dir = path.join(tmpDir, "gassma");
      fs.mkdirSync(dir, { recursive: true });

      expect(() => resolveSchemaFiles({})).toThrow("No .prisma files found");
    });
  });

  describe("recursive subdirectory scanning", () => {
    it("should find .prisma files in subdirectories", () => {
      const dir = path.join(tmpDir, "gassma");
      const subDir = path.join(dir, "models");
      fs.mkdirSync(subDir, { recursive: true });
      fs.writeFileSync(path.join(dir, "schema.prisma"), "content");
      fs.writeFileSync(path.join(subDir, "user.prisma"), "content");

      const files = resolveSchemaFiles({});
      expect(files).toHaveLength(2);
    });

    it("should find .prisma files in deeply nested subdirectories", () => {
      const dir = path.join(tmpDir, "gassma");
      const deepDir = path.join(dir, "models", "detail");
      fs.mkdirSync(deepDir, { recursive: true });
      fs.writeFileSync(path.join(dir, "schema.prisma"), "content");
      fs.writeFileSync(path.join(deepDir, "user.prisma"), "content");

      const files = resolveSchemaFiles({});
      expect(files).toHaveLength(2);
    });

    it("should ignore non-.prisma files in subdirectories", () => {
      const dir = path.join(tmpDir, "gassma");
      const subDir = path.join(dir, "models");
      fs.mkdirSync(subDir, { recursive: true });
      fs.writeFileSync(path.join(dir, "schema.prisma"), "content");
      fs.writeFileSync(path.join(subDir, "readme.md"), "content");

      const files = resolveSchemaFiles({});
      expect(files).toHaveLength(1);
    });

    it("should include relative path in displayName for subdirectory files", () => {
      const dir = path.join(tmpDir, "gassma");
      const subDir = path.join(dir, "models");
      fs.mkdirSync(subDir, { recursive: true });
      fs.writeFileSync(path.join(dir, "schema.prisma"), "content");
      fs.writeFileSync(path.join(subDir, "user.prisma"), "content");

      const files = resolveSchemaFiles({});
      const displayNames = files.map((f) => f.displayName);
      expect(displayNames).toContain("schema.prisma");
      expect(displayNames).toContain(path.join("models", "user.prisma"));
    });
  });
});
