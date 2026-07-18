import { describe, it, expect } from "vitest";
import { validateSchema } from "../../validate/validate";

describe("validateSchema", () => {
  it("should return valid for a correct schema", () => {
    const schema = `
generator client {
  provider = "prisma-client-js"
  output   = "./generated/gassma"
}

model User {
  id   Int    @id
  name String
}
`;
    const result = validateSchema(schema);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should return error for invalid syntax", () => {
    const schema = `
generator client {
  provider = "prisma-client-js"
  output   = "./generated/gassma"

model User {
  id   Int    @id
}
`;
    const result = validateSchema(schema);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should return error when generator output is missing", () => {
    const schema = `
generator client {
  provider = "prisma-client-js"
}

model User {
  id   Int    @id
  name String
}
`;
    const result = validateSchema(schema);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ type: "missingOutput" }),
    );
  });

  it("should return error when the schema has no models", () => {
    const schema = `
generator client {
  provider = "prisma-client-js"
  output   = "./generated/gassma"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
`;
    const result = validateSchema(schema);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ type: "noModels" }),
    );
  });

  it("should return error when the schema has only enums", () => {
    const schema = `
generator client {
  provider = "prisma-client-js"
  output   = "./generated/gassma"
}

enum Role {
  USER
  ADMIN
}
`;
    const result = validateSchema(schema);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ type: "noModels" }),
    );
  });

  it("should return error when no generator block exists", () => {
    const schema = `
model User {
  id   Int    @id
  name String
}
`;
    const result = validateSchema(schema);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ type: "missingGenerator" }),
    );
  });
});
