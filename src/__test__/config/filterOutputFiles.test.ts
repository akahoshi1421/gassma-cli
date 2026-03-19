import fs from "fs";
import path from "path";
import os from "os";
import { filterOutputFiles } from "../../config/filterOutputFiles";
import type { SchemaFile } from "../../config/resolveSchemaFiles";

describe("filterOutputFiles", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-filter-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should exclude files under output directory", () => {
    const schemaDir = path.join(tmpDir, "gassma");
    const outputDir = path.join(schemaDir, "generated");
    fs.mkdirSync(outputDir, { recursive: true });

    const schemaContent = `generator client {
  provider = "prisma-client-js"
  output   = "./generated"
}

model User {
  id Int @id
}`;
    fs.writeFileSync(path.join(schemaDir, "schema.prisma"), schemaContent);
    fs.writeFileSync(
      path.join(outputDir, "schema.prisma"),
      "// generated copy",
    );

    const files: SchemaFile[] = [
      {
        filePath: path.join(schemaDir, "schema.prisma"),
        displayName: "schema.prisma",
      },
      {
        filePath: path.join(outputDir, "schema.prisma"),
        displayName: path.join("generated", "schema.prisma"),
      },
    ];

    const result = filterOutputFiles(files, schemaDir);
    expect(result).toHaveLength(1);
    expect(result[0].displayName).toBe("schema.prisma");
  });

  it("should return all files when no output path is found", () => {
    const schemaDir = path.join(tmpDir, "gassma");
    fs.mkdirSync(schemaDir, { recursive: true });

    fs.writeFileSync(
      path.join(schemaDir, "schema.prisma"),
      "model User { id Int @id }",
    );
    fs.writeFileSync(
      path.join(schemaDir, "post.prisma"),
      "model Post { id Int @id }",
    );

    const files: SchemaFile[] = [
      {
        filePath: path.join(schemaDir, "schema.prisma"),
        displayName: "schema.prisma",
      },
      {
        filePath: path.join(schemaDir, "post.prisma"),
        displayName: "post.prisma",
      },
    ];

    const result = filterOutputFiles(files, schemaDir);
    expect(result).toHaveLength(2);
  });

  it("should handle deeply nested output paths", () => {
    const schemaDir = path.join(tmpDir, "gassma");
    const outputDir = path.join(schemaDir, "src", "generated", "gassma");
    fs.mkdirSync(outputDir, { recursive: true });

    const schemaContent = `generator client {
  provider = "prisma-client-js"
  output   = "./src/generated/gassma"
}`;
    fs.writeFileSync(path.join(schemaDir, "schema.prisma"), schemaContent);
    fs.writeFileSync(path.join(outputDir, "copy.prisma"), "// generated copy");

    const files: SchemaFile[] = [
      {
        filePath: path.join(schemaDir, "schema.prisma"),
        displayName: "schema.prisma",
      },
      {
        filePath: path.join(outputDir, "copy.prisma"),
        displayName: path.join("src", "generated", "gassma", "copy.prisma"),
      },
    ];

    const result = filterOutputFiles(files, schemaDir);
    expect(result).toHaveLength(1);
    expect(result[0].displayName).toBe("schema.prisma");
  });
});
