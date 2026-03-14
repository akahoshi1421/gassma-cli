import fs from "fs";
import path from "path";
import os from "os";
import { resolveSchemaFiles } from "../../config/resolveSchemaFiles";

describe("resolveSchemaFiles", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-resolve-"));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
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
      expect(files[0].filePath).toBe(path.join("custom", "schema.prisma"));
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
});
