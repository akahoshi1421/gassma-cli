import { parseSchemaPath } from "../../generate/parseSchemaPath";

describe("parseSchemaPath", () => {
  it("should parse schema path into directory and filename", () => {
    const result = parseSchemaPath("gassma/test.prisma");

    expect(result).toEqual({ dir: "gassma", file: "test.prisma" });
  });

  it("should handle nested directory paths", () => {
    const result = parseSchemaPath("./gassma/schemas/test.prisma");

    expect(result).toEqual({ dir: "./gassma/schemas", file: "test.prisma" });
  });

  it("should handle absolute paths", () => {
    const result = parseSchemaPath("/Users/test/gassma/test.prisma");

    expect(result).toEqual({
      dir: "/Users/test/gassma",
      file: "test.prisma",
    });
  });

  it("should throw if path does not end with .prisma", () => {
    expect(() => parseSchemaPath("gassma/test.txt")).toThrow();
  });

  it("should throw if path has no directory", () => {
    expect(() => parseSchemaPath("test.prisma")).toThrow();
  });
});
