import { describe, expect, it } from "vitest";
import { validateSchema } from "../../validate/validate";

const generatorBlock = `generator client {
  provider = "prisma-client-js"
  output   = "./generated/gassma"
}`;

const messagesOf = (schema: string) =>
  validateSchema(schema)
    .errors.map((error) => error.message)
    .join("\n");

describe("validateSchema with unsupported attributes", () => {
  it("should stay valid for a field marked @unique", () => {
    const schema = `${generatorBlock}

model Staff {
  id    Int    @id
  email String @unique
}
`;
    expect(validateSchema(schema)).toEqual({ valid: true, errors: [] });
  });

  it("should stay valid for the one-to-one shape Prisma requires @unique for", () => {
    const schema = `${generatorBlock}

model Staff {
  id      Int      @id
  profile Profile?
}

model Profile {
  id      Int   @id
  staffId Int   @unique
  staff   Staff @relation(fields: [staffId], references: [id])
}
`;
    expect(validateSchema(schema)).toEqual({ valid: true, errors: [] });
  });

  it("should stay valid for a model that declares @@unique", () => {
    const schema = `${generatorBlock}

model Staff {
  id        Int    @id
  firstName String
  lastName  String

  @@unique([firstName, lastName])
}
`;
    expect(validateSchema(schema)).toEqual({ valid: true, errors: [] });
  });

  it("should report one error per violating target", () => {
    const schema = `${generatorBlock}

model Staff {
  id    Int    @id
  email String @db.VarChar(255)
  code  String @db.Text
}
`;
    const result = validateSchema(schema);

    const nativeTypeErrors = result.errors.filter(
      (error) => error.type === "unsupportedAttribute",
    );
    expect(nativeTypeErrors).toHaveLength(2);
  });

  it("should report @@id", () => {
    const schema = `${generatorBlock}

model Enrollment {
  studentId Int
  courseId  Int

  @@id([studentId, courseId])
}
`;
    expect(messagesOf(schema)).toContain(
      "`@@id` on Enrollment (studentId, courseId) is not supported.",
    );
  });

  it("should report @@index", () => {
    const schema = `${generatorBlock}

model Staff {
  id   Int    @id
  name String

  @@index([name])
}
`;
    expect(messagesOf(schema)).toContain(
      "`@@index` on Staff (name) is not supported.",
    );
  });

  it("should report @@fulltext", () => {
    const schema = `${generatorBlock}

model Staff {
  id  Int    @id
  bio String

  @@fulltext([bio])
}
`;
    expect(messagesOf(schema)).toContain(
      "`@@fulltext` on Staff (bio) is not supported.",
    );
  });

  it("should report a native type", () => {
    const schema = `${generatorBlock}

model Staff {
  id   Int    @id
  name String @db.VarChar(255)
}
`;
    expect(messagesOf(schema)).toContain(
      "`@db.VarChar` on Staff.name is not supported.",
    );
  });

  it("should stay valid without unsupported attributes", () => {
    const schema = `${generatorBlock}

model Staff {
  id    Int    @id @default(autoincrement())
  email String @map("Email Address")

  @@map("staff sheet")
}
`;
    expect(validateSchema(schema).valid).toBe(true);
  });
});
