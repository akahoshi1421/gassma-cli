import { describe, expect, it } from "vitest";
import { buildMigrateModels } from "../../migrate/buildMigrateModels";

describe("buildMigrateModels", () => {
  it("should list scalar columns in declaration order", () => {
    const schema = `
model User {
  id    Int    @id
  name  String
  email String
}
`;
    expect(buildMigrateModels(schema)).toEqual([
      { name: "User", columns: ["id", "name", "email"] },
    ]);
  });

  it("should strip the optional suffix from optional fields", () => {
    const schema = `
model User {
  id  Int  @id
  age Int?
}
`;
    expect(buildMigrateModels(schema)).toEqual([
      { name: "User", columns: ["id", "age"] },
    ]);
  });

  it("should keep every model in declaration order", () => {
    const schema = `
model Post {
  id Int @id
}

model User {
  id Int @id
}
`;
    const models = buildMigrateModels(schema);
    expect(models.map((model) => model.name)).toEqual(["Post", "User"]);
  });

  it("should use @map physical column names", () => {
    const schema = `
model User {
  id       Int    @id
  fullName String @map("full_name")
}
`;
    expect(buildMigrateModels(schema)).toEqual([
      { name: "User", columns: ["id", "full_name"] },
    ]);
  });

  it("should use the @@map physical sheet name", () => {
    const schema = `
model User {
  id Int @id

  @@map("users")
}
`;
    expect(buildMigrateModels(schema)).toEqual([
      { name: "users", columns: ["id"] },
    ]);
  });

  it("should keep @ignore fields at their declared position", () => {
    const schema = `
model User {
  id       Int    @id
  internal String @ignore
  email    String
}
`;
    expect(buildMigrateModels(schema)).toEqual([
      { name: "User", columns: ["id", "internal", "email"] },
    ]);
  });

  it("should include @@ignore models with their columns", () => {
    const schema = `
model User {
  id Int @id
}

model AuditLog {
  id      Int    @id
  message String

  @@ignore
}
`;
    expect(buildMigrateModels(schema)).toEqual([
      { name: "User", columns: ["id"] },
      { name: "AuditLog", columns: ["id", "message"] },
    ]);
  });

  it("should apply @map inside @@ignore models", () => {
    const schema = `
model AuditLog {
  id      Int    @id
  message String @map("log_message")

  @@ignore
}
`;
    expect(buildMigrateModels(schema)).toEqual([
      { name: "AuditLog", columns: ["id", "log_message"] },
    ]);
  });

  it("should include enum columns", () => {
    const schema = `
enum Role {
  USER
  ADMIN
}

model User {
  id   Int  @id
  role Role @default(USER)
}
`;
    expect(buildMigrateModels(schema)).toEqual([
      { name: "User", columns: ["id", "role"] },
    ]);
  });

  it("should exclude relation object fields but keep FK scalar columns", () => {
    const schema = `
model Post {
  id       Int  @id
  author   User @relation(fields: [authorId], references: [id])
  authorId Int
}

model User {
  id    Int    @id
  posts Post[]
}
`;
    expect(buildMigrateModels(schema)).toEqual([
      { name: "Post", columns: ["id", "authorId"] },
      { name: "User", columns: ["id"] },
    ]);
  });

  it("should append one through sheet for an implicit many-to-many", () => {
    const schema = `
model Post {
  id   Int   @id
  tags Tag[]
}

model Tag {
  id    Int    @id
  posts Post[]
}
`;
    expect(buildMigrateModels(schema)).toEqual([
      { name: "Post", columns: ["id"] },
      { name: "Tag", columns: ["id"] },
      { name: "_PostToTag", columns: ["postId", "tagId"] },
    ]);
  });

  it("should order through sheet columns by model name even when declared inversely", () => {
    const schema = `
model Tag {
  id    Int    @id
  posts Post[]
}

model Post {
  id   Int   @id
  tags Tag[]
}
`;
    const models = buildMigrateModels(schema);
    expect(models).toContainEqual({
      name: "_PostToTag",
      columns: ["postId", "tagId"],
    });
    expect(models.filter((model) => model.name === "_PostToTag")).toHaveLength(
      1,
    );
  });

  it("should not let @@map affect the through sheet name", () => {
    const schema = `
model Post {
  id   Int   @id
  tags Tag[]

  @@map("記事")
}

model Tag {
  id    Int    @id
  posts Post[]
}
`;
    const models = buildMigrateModels(schema);
    expect(models.map((model) => model.name)).toEqual([
      "記事",
      "Tag",
      "_PostToTag",
    ]);
    expect(models[2].columns).toEqual(["postId", "tagId"]);
  });

  it("should not create a through sheet for one-to-many relations", () => {
    const schema = `
model Post {
  id       Int  @id
  author   User @relation(fields: [authorId], references: [id])
  authorId Int
}

model User {
  id    Int    @id
  posts Post[]
}
`;
    const models = buildMigrateModels(schema);
    expect(models.map((model) => model.name)).toEqual(["Post", "User"]);
  });

  it("should return an empty array for a schema without models", () => {
    const schema = `
datasource db {
  provider = "gassma"
  url      = "https://docs.google.com/spreadsheets/d/abc123/edit"
}
`;
    expect(buildMigrateModels(schema)).toEqual([]);
  });
});
