import { describe, it, expect } from "vitest";
import { extractOptionalFields } from "../../../generate/read/extractOptionalFields";

describe("extractOptionalFields", () => {
  it("should mark @default fields as omittable on input", () => {
    const schema = `
model User {
  id        Int      @id @default(autoincrement())
  name      String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}
`;
    const result = extractOptionalFields(schema);

    expect(result.User).toContain("id");
    expect(result.User).toContain("isActive");
    expect(result.User).toContain("createdAt");
    expect(result.User).not.toContain("name");
  });

  it("should mark @updatedAt fields as omittable", () => {
    const schema = `
model Post {
  id        Int      @id
  title     String
  updatedAt DateTime @updatedAt
}
`;
    const result = extractOptionalFields(schema);

    expect(result.Post).toContain("updatedAt");
    expect(result.Post).not.toContain("title");
  });

  it("should mark nullable fields as omittable", () => {
    const schema = `
model User {
  id   Int  @id
  name String
  age  Int?
}
`;
    const result = extractOptionalFields(schema);

    expect(result.User).toContain("age");
    expect(result.User).not.toContain("name");
  });

  it("should skip @ignore fields and @@ignore models", () => {
    const schema = `
model User {
  id     Int    @id
  secret String @ignore
  age    Int?
}

model Logs {
  id  Int  @id
  age Int?

  @@ignore
}
`;
    const result = extractOptionalFields(schema);

    expect(result.User).toContain("age");
    expect(result.User).not.toContain("secret");
    expect(result.Logs).toBeUndefined();
  });

  it("should return empty array for models with no omittable fields", () => {
    const schema = `
model User {
  id   Int    @id
  name String
}
`;
    const result = extractOptionalFields(schema);

    expect(result.User).toEqual([]);
  });
});
