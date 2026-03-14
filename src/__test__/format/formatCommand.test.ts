import fs from "fs";
import path from "path";
import os from "os";
import { format } from "../../format/formatCommand";

describe("format", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-format-"));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe("with --schema", () => {
    it("should format a specific schema file", async () => {
      const dir = path.join(tmpDir, "gassma");
      fs.mkdirSync(dir, { recursive: true });
      const schemaPath = path.join(dir, "test.prisma");
      fs.writeFileSync(
        schemaPath,
        "model User {\nid Int @id\nname    String\n}\n",
      );

      await format({ schema: "gassma/test.prisma" });

      const result = fs.readFileSync(schemaPath, "utf-8");
      expect(result).toBe(
        "model User {\n  id   Int    @id\n  name String\n}\n",
      );
    });

    it("should throw if schema file not found", async () => {
      await expect(
        format({ schema: "gassma/notfound.prisma" }),
      ).rejects.toThrow("Schema file not found");
    });
  });

  describe("with default gassma directory", () => {
    it("should format all .prisma files in gassma/", async () => {
      const dir = path.join(tmpDir, "gassma");
      fs.mkdirSync(dir, { recursive: true });

      const schema1 = path.join(dir, "a.prisma");
      const schema2 = path.join(dir, "b.prisma");
      fs.writeFileSync(
        schema1,
        "model Post {\nid Int @id\ntitle    String\n}\n",
      );
      fs.writeFileSync(
        schema2,
        "model Comment {\nid Int @id\nbody    String\n}\n",
      );

      await format();

      const result1 = fs.readFileSync(schema1, "utf-8");
      const result2 = fs.readFileSync(schema2, "utf-8");
      expect(result1).toContain("  id    Int    @id");
      expect(result1).toContain("  title String");
      expect(result2).toContain("  id   Int    @id");
      expect(result2).toContain("  body String");
    });

    it("should throw if gassma/ directory not found", async () => {
      await expect(format()).rejects.toThrow("directory not found");
    });

    it("should throw if no .prisma files found", async () => {
      const dir = path.join(tmpDir, "gassma");
      fs.mkdirSync(dir, { recursive: true });

      await expect(format()).rejects.toThrow("No .prisma files found");
    });
  });

  describe("with --check", () => {
    it("should not modify file and return true when already formatted", async () => {
      const dir = path.join(tmpDir, "gassma");
      fs.mkdirSync(dir, { recursive: true });
      const schemaPath = path.join(dir, "test.prisma");
      const formatted = "model User {\n  id   Int    @id\n  name String\n}\n";
      fs.writeFileSync(schemaPath, formatted);

      const result = await format({
        schema: "gassma/test.prisma",
        check: true,
      });

      expect(result).toBe(true);
      expect(fs.readFileSync(schemaPath, "utf-8")).toBe(formatted);
    });

    it("should not modify file and return false when not formatted", async () => {
      const dir = path.join(tmpDir, "gassma");
      fs.mkdirSync(dir, { recursive: true });
      const schemaPath = path.join(dir, "test.prisma");
      const unformatted = "model User {\nid Int @id\nname    String\n}\n";
      fs.writeFileSync(schemaPath, unformatted);

      const result = await format({
        schema: "gassma/test.prisma",
        check: true,
      });

      expect(result).toBe(false);
      expect(fs.readFileSync(schemaPath, "utf-8")).toBe(unformatted);
    });
  });
});
