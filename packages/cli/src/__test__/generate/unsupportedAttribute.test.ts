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

describe("generate with unsupported attributes", () => {
  let tmpDir: string;
  let schemaDir: string;
  let outDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-unsupported-"));
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

  it("should reject @@unique", () => {
    const schemaPath = writeSchema(`model Staff {
  id    Int    @id
  email String

  @@unique([email])
}`);

    expect(() => generate({ schema: schemaPath })).toThrow(
      UnsupportedAttributeError,
    );
    expect(fs.existsSync(outDir)).toBe(false);
  });

  it("should reject @@id", () => {
    const schemaPath = writeSchema(`model Enrollment {
  studentId Int
  courseId  Int

  @@id([studentId, courseId])
}`);

    expect(() => generate({ schema: schemaPath })).toThrow(
      /Enrollment \(studentId, courseId\)/,
    );
    expect(fs.existsSync(outDir)).toBe(false);
  });

  it("should reject @@index", () => {
    const schemaPath = writeSchema(`model Staff {
  id   Int    @id
  name String

  @@index([name])
}`);

    expect(() => generate({ schema: schemaPath })).toThrow(/@@index/);
    expect(fs.existsSync(outDir)).toBe(false);
  });

  it("should reject @@fulltext", () => {
    const schemaPath = writeSchema(`model Staff {
  id  Int    @id
  bio String

  @@fulltext([bio])
}`);

    expect(() => generate({ schema: schemaPath })).toThrow(/@@fulltext/);
    expect(fs.existsSync(outDir)).toBe(false);
  });

  it("should reject a native type", () => {
    const schemaPath = writeSchema(`model Staff {
  id   Int    @id
  name String @db.VarChar(255)
}`);

    expect(() => generate({ schema: schemaPath })).toThrow(/@db\.VarChar/);
    expect(fs.existsSync(outDir)).toBe(false);
  });

  it("should generate when only supported attributes are used", () => {
    const schemaPath = writeSchema(`model Staff {
  id    Int    @id @default(autoincrement())
  email String @map("Email Address")

  @@map("staff sheet")
}`);

    expect(() => generate({ schema: schemaPath })).not.toThrow();
    expect(fs.existsSync(path.join(outDir, "schemaClient.js"))).toBe(true);
  });
});
