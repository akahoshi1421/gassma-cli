import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CompositeRelationError } from "../../error/mainError";
import { generate } from "../../generate/generate";

const generatorBlock = (outDir: string) => `generator client {
  provider = "prisma-client-js"
  output   = "${outDir}"
}`;

describe("generate with a composite foreign key", () => {
  let tmpDir: string;
  let schemaDir: string;
  let outDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-composite-"));
    schemaDir = path.join(tmpDir, "gassma");
    outDir = path.join(tmpDir, "generated");
    fs.mkdirSync(schemaDir);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const writeSchema = (models: string) => {
    const schemaPath = path.join(schemaDir, "schema.prisma");
    fs.writeFileSync(schemaPath, `${generatorBlock(outDir)}\n\n${models}\n`);
    return schemaPath;
  };

  it("should throw CompositeRelationError instead of generating", () => {
    const schemaPath = writeSchema(`model Staff {
  id        Int     @id @default(autoincrement())
  firstName String
  lastName  String
  shifts    Shift[]

  @@unique([firstName, lastName])
}

model Shift {
  id             Int   @id @default(autoincrement())
  staffFirstName String
  staffLastName  String
  staff          Staff @relation(fields: [staffFirstName, staffLastName], references: [firstName, lastName])
}`);

    expect(() => generate({ schema: schemaPath })).toThrow(
      CompositeRelationError,
    );
    expect(fs.existsSync(outDir)).toBe(false);
  });

  it("should tell which model and field carries it", () => {
    const schemaPath = writeSchema(`model Staff {
  id        Int     @id @default(autoincrement())
  firstName String
  lastName  String
  shifts    Shift[]

  @@unique([firstName, lastName])
}

model Shift {
  id             Int   @id @default(autoincrement())
  staffFirstName String
  staffLastName  String
  staff          Staff @relation(fields: [staffFirstName, staffLastName], references: [firstName, lastName])
}`);

    expect(() => generate({ schema: schemaPath })).toThrow(/Shift\.staff/);
  });

  it("should generate from a single column relation", () => {
    const schemaPath = writeSchema(`model Staff {
  id     Int     @id @default(autoincrement())
  shifts Shift[]
}

model Shift {
  id      Int   @id @default(autoincrement())
  staffId Int
  staff   Staff @relation(fields: [staffId], references: [id])
}`);

    expect(() => generate({ schema: schemaPath })).not.toThrow();
    expect(fs.existsSync(path.join(outDir, "schemaClient.js"))).toBe(true);
  });
});
