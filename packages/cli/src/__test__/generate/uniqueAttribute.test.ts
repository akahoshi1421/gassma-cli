import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UnsupportedAttributeError } from "../../error/mainError";
import { generate } from "../../generate/generate";

const generatorBlock = (outDir: string) => `generator client {
  provider = "prisma-client-js"
  output   = "${outDir}"
}`;

describe("generate with @unique", () => {
  let tmpDir: string;
  let schemaDir: string;
  let outDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-unique-"));
    schemaDir = path.join(tmpDir, "gassma");
    outDir = path.join(tmpDir, "generated");
    fs.mkdirSync(schemaDir);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const writeSchema = (model: string) => {
    const schemaPath = path.join(schemaDir, "schema.prisma");
    fs.writeFileSync(schemaPath, `${generatorBlock(outDir)}\n\n${model}\n`);
    return schemaPath;
  };

  it("should throw UnsupportedAttributeError instead of generating", () => {
    const schemaPath = writeSchema(`model Staff {
  id    Int    @id
  email String @unique
}`);

    expect(() => generate({ schema: schemaPath })).toThrow(
      UnsupportedAttributeError,
    );
    expect(fs.existsSync(outDir)).toBe(false);
  });

  it("should tell which model and field carries it", () => {
    const schemaPath = writeSchema(`model Staff {
  id    Int    @id
  email String @unique
}`);

    expect(() => generate({ schema: schemaPath })).toThrow(/Staff\.email/);
  });

  it("should generate when @unique is removed", () => {
    const schemaPath = writeSchema(`model Staff {
  id    Int    @id
  email String
}`);

    expect(() => generate({ schema: schemaPath })).not.toThrow();
    expect(fs.existsSync(path.join(outDir, "schemaClient.js"))).toBe(true);
  });
});
