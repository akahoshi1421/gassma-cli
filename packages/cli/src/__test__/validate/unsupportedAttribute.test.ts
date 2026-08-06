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
  it("should report unsupportedAttribute for a field marked @unique", () => {
    const schema = `${generatorBlock}

model Staff {
  id    Int    @id
  email String @unique
}
`;
    const result = validateSchema(schema);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ type: "unsupportedAttribute" }),
    );
    const messages = result.errors.map((error) => error.message).join("\n");
    expect(messages).toContain("Staff.email");
    expect(messages).toContain("@unique");
  });

  it("should report one error per violating target", () => {
    const schema = `${generatorBlock}

model Staff {
  id    Int    @id
  email String @unique
  code  String @unique
}
`;
    const result = validateSchema(schema);

    const uniqueErrors = result.errors.filter(
      (error) => error.type === "unsupportedAttribute",
    );
    expect(uniqueErrors).toHaveLength(2);
  });

  it("should report @@unique with the model and its fields", () => {
    const schema = `${generatorBlock}

model Staff {
  id    Int    @id
  email String

  @@unique([email])
}
`;
    expect(messagesOf(schema)).toContain(
      "`@@unique` on Staff (email) is not supported. " +
        "GASsma cannot enforce uniqueness on a spreadsheet. " +
        "Remove it, or check uniqueness in your code.",
    );
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
