import { describe, it, expect } from "vitest";
import { countModels } from "../../../generate/read/countModels";

describe("countModels", () => {
  it("should return 0 for a schema with only generator and datasource", () => {
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
    expect(countModels(schema)).toBe(0);
  });

  it("should return 0 for a schema with only enums", () => {
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
    expect(countModels(schema)).toBe(0);
  });

  it("should count model declarations", () => {
    const schema = `
model User {
  id   Int    @id
  name String
}

model Post {
  id    Int    @id
  title String
}
`;
    expect(countModels(schema)).toBe(2);
  });

  it("should exclude models with @@ignore", () => {
    const schema = `
model User {
  id Int @id

  @@ignore
}
`;
    expect(countModels(schema)).toBe(0);
  });
});
