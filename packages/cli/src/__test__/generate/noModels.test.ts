import fs from "fs";
import os from "os";
import path from "path";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { generate } from "../../generate/generate";
import { NoModelsError } from "../../error/mainError";

const generatorBlock = (outDir: string) => `generator client {
  provider = "prisma-client-js"
  output   = "${outDir}"
}`;

const datasourceBlock = `datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}`;

const userModel = `model User {
  id   Int    @id
  name String
}`;

describe("generate with no models", () => {
  let tmpDir: string;
  let schemaDir: string;
  let outDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-no-models-"));
    schemaDir = path.join(tmpDir, "gassma");
    outDir = path.join(tmpDir, "generated");
    fs.mkdirSync(schemaDir);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should throw NoModelsError for a generator and datasource only schema", () => {
    const schemaPath = path.join(schemaDir, "schema.prisma");
    fs.writeFileSync(
      schemaPath,
      `${generatorBlock(outDir)}\n\n${datasourceBlock}\n`,
    );

    expect(() => generate({ schema: schemaPath })).toThrow(NoModelsError);
    expect(fs.existsSync(outDir)).toBe(false);
  });

  it("should throw NoModelsError for an enum only schema", () => {
    const schemaPath = path.join(schemaDir, "schema.prisma");
    fs.writeFileSync(
      schemaPath,
      `${generatorBlock(outDir)}\n\nenum Role {\n  USER\n  ADMIN\n}\n`,
    );

    expect(() => generate({ schema: schemaPath })).toThrow(NoModelsError);
    expect(fs.existsSync(outDir)).toBe(false);
  });

  it("should include the schema location in the error message", () => {
    const schemaPath = path.join(schemaDir, "schema.prisma");
    fs.writeFileSync(schemaPath, `${generatorBlock(outDir)}\n`);

    expect(() => generate({ schema: schemaPath })).toThrow(
      path.resolve(schemaPath),
    );
  });

  it("should generate successfully when a model exists", () => {
    const schemaPath = path.join(schemaDir, "schema.prisma");
    fs.writeFileSync(schemaPath, `${generatorBlock(outDir)}\n\n${userModel}\n`);

    expect(() => generate({ schema: schemaPath })).not.toThrow();
    expect(fs.existsSync(path.join(outDir, "schemaClient.d.ts"))).toBe(true);
    expect(fs.existsSync(path.join(outDir, "schemaClient.js"))).toBe(true);
  });

  it("should throw NoModelsError when no file in a multi-file schema has models", () => {
    fs.writeFileSync(
      path.join(schemaDir, "main.prisma"),
      `${generatorBlock(outDir)}\n\n${datasourceBlock}\n`,
    );
    fs.writeFileSync(
      path.join(schemaDir, "enums.prisma"),
      "enum Role {\n  USER\n  ADMIN\n}\n",
    );

    expect(() => generate({ schema: schemaDir })).toThrow(NoModelsError);
    expect(fs.existsSync(outDir)).toBe(false);
  });

  it("should generate successfully when one file in a multi-file schema has a model", () => {
    fs.writeFileSync(
      path.join(schemaDir, "main.prisma"),
      `${generatorBlock(outDir)}\n\n${datasourceBlock}\n`,
    );
    fs.writeFileSync(path.join(schemaDir, "user.prisma"), `${userModel}\n`);

    expect(() => generate({ schema: schemaDir })).not.toThrow();
    expect(fs.existsSync(path.join(outDir, "gassmaClient.d.ts"))).toBe(true);
  });
});
