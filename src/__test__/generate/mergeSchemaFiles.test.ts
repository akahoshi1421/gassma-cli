import fs from "fs";
import path from "path";
import os from "os";
import { mergeSchemaFiles } from "../../generate/mergeSchemaFiles";

describe("mergeSchemaFiles", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-merge-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should merge multiple files into a single string", () => {
    const file1 = path.join(tmpDir, "a.prisma");
    const file2 = path.join(tmpDir, "b.prisma");
    fs.writeFileSync(file1, "model User { id Int }");
    fs.writeFileSync(file2, "model Post { id Int }");

    const result = mergeSchemaFiles([file1, file2]);
    expect(result).toContain("model User { id Int }");
    expect(result).toContain("model Post { id Int }");
  });

  it("should return single file content as-is", () => {
    const file = path.join(tmpDir, "schema.prisma");
    fs.writeFileSync(file, "model User { id Int }");

    const result = mergeSchemaFiles([file]);
    expect(result).toBe("model User { id Int }");
  });

  it("should separate files with double newlines", () => {
    const file1 = path.join(tmpDir, "a.prisma");
    const file2 = path.join(tmpDir, "b.prisma");
    fs.writeFileSync(file1, "model A {}");
    fs.writeFileSync(file2, "model B {}");

    const result = mergeSchemaFiles([file1, file2]);
    expect(result).toBe("model A {}\n\nmodel B {}");
  });

  it("should handle empty files gracefully", () => {
    const file1 = path.join(tmpDir, "a.prisma");
    const file2 = path.join(tmpDir, "b.prisma");
    fs.writeFileSync(file1, "");
    fs.writeFileSync(file2, "model B {}");

    const result = mergeSchemaFiles([file1, file2]);
    expect(result).toContain("model B {}");
  });
});
