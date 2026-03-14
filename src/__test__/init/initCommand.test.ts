import fs from "fs";
import path from "path";
import os from "os";
import { init } from "../../init/initCommand";

describe("init", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-init-"));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should create gassma directory and schema.prisma", () => {
    init();

    const schemaPath = path.join(tmpDir, "gassma", "schema.prisma");
    expect(fs.existsSync(schemaPath)).toBe(true);

    const content = fs.readFileSync(schemaPath, "utf-8");
    expect(content).toContain("generator client");
    expect(content).toContain('output   = "./src/generated/gassma"');
  });

  it("should throw if schema.prisma already exists", () => {
    const gassmaDir = path.join(tmpDir, "gassma");
    fs.mkdirSync(gassmaDir, { recursive: true });
    fs.writeFileSync(path.join(gassmaDir, "schema.prisma"), "existing");

    expect(() => init()).toThrow("already exists");
  });

  it("should pass output option to template", () => {
    init({ output: "./custom/output" });

    const content = fs.readFileSync(
      path.join(tmpDir, "gassma", "schema.prisma"),
      "utf-8",
    );
    expect(content).toContain('./custom/output"');
  });

  it("should include model with withModel option", () => {
    init({ withModel: true });

    const content = fs.readFileSync(
      path.join(tmpDir, "gassma", "schema.prisma"),
      "utf-8",
    );
    expect(content).toContain("model User");
  });

  it("should not recreate existing gassma directory", () => {
    const gassmaDir = path.join(tmpDir, "gassma");
    fs.mkdirSync(gassmaDir, { recursive: true });

    init();

    expect(fs.existsSync(path.join(gassmaDir, "schema.prisma"))).toBe(true);
  });
});
