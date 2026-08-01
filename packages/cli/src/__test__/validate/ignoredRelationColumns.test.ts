import { describe, it, expect } from "vitest";
import { validateSchema } from "../../validate/validate";

describe("validateSchema with @ignore relation columns", () => {
  it("should report ignoredRelationColumn for an @ignore FK column", () => {
    const schema = `
generator client {
  provider = "prisma-client-js"
  output   = "./generated/gassma"
}

model User {
  id    Int    @id
  posts Post[]
}

model Post {
  id       Int  @id
  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId Int  @ignore
}
`;
    const result = validateSchema(schema);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ type: "ignoredRelationColumn" }),
    );
    const messages = result.errors.map((error) => error.message).join("\n");
    expect(messages).toContain("authorId");
    expect(messages).toContain("Post");
    expect(messages).toContain("@ignore");
  });

  it("should report one error per violating column", () => {
    const schema = `
generator client {
  provider = "prisma-client-js"
  output   = "./generated/gassma"
}

model User {
  id    Int    @id
  posts Post[]
  likes Like[]
}

model Post {
  id       Int  @id
  author   User @relation(fields: [authorId], references: [id])
  authorId Int  @ignore
}

model Like {
  id     Int  @id
  user   User @relation(fields: [userId], references: [id])
  userId Int  @ignore
}
`;
    const result = validateSchema(schema);

    const relationErrors = result.errors.filter(
      (error) => error.type === "ignoredRelationColumn",
    );
    expect(relationErrors).toHaveLength(2);
  });

  it("should stay valid when @ignore is on a column no relation uses", () => {
    const schema = `
generator client {
  provider = "prisma-client-js"
  output   = "./generated/gassma"
}

model User {
  id     Int    @id
  secret String @ignore
  posts  Post[]
}

model Post {
  id       Int  @id
  author   User @relation(fields: [authorId], references: [id])
  authorId Int
}
`;
    const result = validateSchema(schema);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should keep through sheet conflicts out of validate results", () => {
    const schema = `
generator client {
  provider = "prisma-client-js"
  output   = "./generated/gassma"
}

model Post {
  id   Int   @id
  tags Tag[] @relation("Links")
}

model Tag {
  id    Int    @id
  posts Post[] @relation("Links")
}

model User {
  id     Int     @id
  groups Group[] @relation("Links")
}

model Group {
  id    Int    @id
  users User[] @relation("Links")
}
`;
    const result = validateSchema(schema);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
