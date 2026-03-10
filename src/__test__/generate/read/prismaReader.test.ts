import { prismaReader } from "../../../generate/read/prismaReader";

describe("prismaReader", () => {
  it("should parse a simple model with scalar fields", () => {
    const schema = `
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String?
}
`;
    const result = prismaReader(schema);

    expect(result).toEqual({
      User: {
        id: ["number"],
        name: ["string"],
        "email?": ["string"],
      },
    });
  });

  it("should parse multiple models", () => {
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
    const result = prismaReader(schema);

    expect(result).toEqual({
      User: {
        id: ["number"],
        name: ["string"],
      },
      Post: {
        id: ["number"],
        title: ["string"],
      },
    });
  });

  it("should ignore datasource and generator blocks", () => {
    const schema = `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id   Int    @id
  name String
}
`;
    const result = prismaReader(schema);

    expect(Object.keys(result)).toEqual(["User"]);
  });

  it("should map Prisma types to TypeScript types", () => {
    const schema = `
model TypeTest {
  intField      Int
  floatField    Float
  stringField   String
  boolField     Boolean
  dateField     DateTime
  bigIntField   BigInt
  decimalField  Decimal
}
`;
    const result = prismaReader(schema);

    expect(result).toEqual({
      TypeTest: {
        intField: ["number"],
        floatField: ["number"],
        stringField: ["string"],
        boolField: ["boolean"],
        dateField: ["Date"],
        bigIntField: ["number"],
        decimalField: ["number"],
      },
    });
  });

  it("should handle optional fields with ? suffix in key", () => {
    const schema = `
model User {
  id    Int     @id
  name  String
  bio   String?
  age   Int?
}
`;
    const result = prismaReader(schema);

    expect(result.User["bio?"]).toEqual(["string"]);
    expect(result.User["age?"]).toEqual(["number"]);
    expect(result.User.name).toEqual(["string"]);
  });

  it("should ignore @id, @default, @unique, @map attributes", () => {
    const schema = `
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String @map("user_name")
}
`;
    const result = prismaReader(schema);

    expect(result.User.id).toEqual(["number"]);
    expect(result.User.email).toEqual(["string"]);
    expect(result.User.name).toEqual(["string"]);
  });

  it("should ignore @@index, @@unique, @@map block attributes", () => {
    const schema = `
model User {
  id    Int    @id
  name  String
  email String

  @@index([name])
  @@unique([email])
  @@map("users")
}
`;
    const result = prismaReader(schema);

    expect(result.User).toEqual({
      id: ["number"],
      name: ["string"],
      email: ["string"],
    });
  });

  it("should ignore enum declarations", () => {
    const schema = `
enum Role {
  USER
  ADMIN
}

model User {
  id   Int    @id
  name String
}
`;
    const result = prismaReader(schema);

    expect(Object.keys(result)).toEqual(["User"]);
  });

  it("should add types from @gassma.addType comment", () => {
    const schema = `
model User {
  /// @gassma.addType string
  id    Int    @id
  name  String
}
`;
    const result = prismaReader(schema);

    expect(result.User.id).toEqual(["number", "string"]);
    expect(result.User.name).toEqual(["string"]);
  });

  it("should add multiple types from @gassma.addType comment", () => {
    const schema = `
model User {
  /// @gassma.addType string, boolean
  id Int @id
}
`;
    const result = prismaReader(schema);

    expect(result.User.id).toEqual(["number", "string", "boolean"]);
  });

  it("should convert enum fields to literal union types", () => {
    const schema = `
enum Role {
  ADMIN
  USER
  MODERATOR
}

model User {
  id   Int  @id
  role Role
}
`;
    const result = prismaReader(schema);

    expect(result.User.role).toEqual(["ADMIN", "USER", "MODERATOR"]);
  });

  it("should handle optional enum fields", () => {
    const schema = `
enum Status {
  ACTIVE
  INACTIVE
}

model User {
  id     Int     @id
  status Status?
}
`;
    const result = prismaReader(schema);

    expect(result.User["status?"]).toEqual(["ACTIVE", "INACTIVE"]);
  });

  it("should replace base type with @gassma.replaceType", () => {
    const schema = `
model User {
  id   Int    @id
  /// @gassma.replaceType "admin", "user", "moderator"
  role String
}
`;
    const result = prismaReader(schema);

    expect(result.User.role).toEqual(["admin", "user", "moderator"]);
  });

  it("should not include base type when using replaceType", () => {
    const schema = `
model User {
  id   Int    @id
  /// @gassma.replaceType "active", "inactive"
  status String
}
`;
    const result = prismaReader(schema);

    expect(result.User.status).not.toContain("string");
    expect(result.User.status).toEqual(["active", "inactive"]);
  });

  it("should ignore relation fields (list types referencing other models)", () => {
    const schema = `
model User {
  id    Int    @id
  name  String
  posts Post[]
}

model Post {
  id       Int    @id
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int
}
`;
    const result = prismaReader(schema);

    expect(result.User).toEqual({
      id: ["number"],
      name: ["string"],
    });
    expect(result.Post).toEqual({
      id: ["number"],
      title: ["string"],
      authorId: ["number"],
    });
  });
});
