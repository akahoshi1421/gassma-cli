import { describe, expect, it } from "vitest";
import { UnsupportedAttributeError } from "../../../error/mainError";
import { assertNoUnsupportedAttributes } from "../../../generate/read/assertNoUnsupportedAttributes";

describe("assertNoUnsupportedAttributes with @unique", () => {
  it("should accept a field marked @unique", () => {
    const schema = `
model Staff {
  id    Int    @id
  email String @unique
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).not.toThrow();
  });

  it("should accept the @unique a one-to-one relation needs on its foreign key", () => {
    const schema = `
model Staff {
  id      Int      @id
  profile Profile?
}

model Profile {
  id      Int    @id
  staffId Int    @unique
  staff   Staff  @relation(fields: [staffId], references: [id])
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).not.toThrow();
  });

  it("should accept the @unique a relation needs to reference a field other than the id", () => {
    const schema = `
model Staff {
  id     Int     @id
  email  String  @unique
  shifts Shift[]
}

model Shift {
  id         Int    @id
  staffEmail String
  staff      Staff  @relation(fields: [staffEmail], references: [email])
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).not.toThrow();
  });

  it("should accept @unique combined with other attributes", () => {
    const schema = `
model Staff {
  id    Int    @id
  email String @unique @map("Email Address")
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).not.toThrow();
  });

  it("should still reject a native type declared next to @unique", () => {
    const schema = `
model Staff {
  id    Int    @id
  email String @unique @db.VarChar(255)
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).toThrow(/@db\.VarChar/);
  });

  it("should not be fooled by a field named unique", () => {
    const schema = `
model Staff {
  id     Int    @id
  unique String
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).not.toThrow();
  });
});

describe("assertNoUnsupportedAttributes with @@unique", () => {
  it("should accept a model marked @@unique", () => {
    const schema = `
model Staff {
  id    Int    @id
  email String

  @@unique([email])
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).not.toThrow();
  });

  it("should accept the @@unique a composite one-to-many references", () => {
    const schema = `
model Staff {
  id        Int     @id
  firstName String
  lastName  String
  shifts    Shift[]

  @@unique([firstName, lastName])
}

model Shift {
  id             Int    @id
  staffFirstName String
  staffLastName  String
  staff          Staff  @relation(fields: [staffFirstName, staffLastName], references: [firstName, lastName])
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).not.toThrow();
  });

  it("should accept the @@unique a composite one-to-one needs on the defining side", () => {
    const schema = `
model Staff {
  id        Int      @id
  firstName String
  lastName  String
  profile   Profile?

  @@unique([firstName, lastName])
}

model Profile {
  id             Int    @id
  staffFirstName String
  staffLastName  String
  staff          Staff  @relation(fields: [staffFirstName, staffLastName], references: [firstName, lastName])

  @@unique([staffFirstName, staffLastName])
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).not.toThrow();
  });

  it("should accept the named fields argument", () => {
    const schema = `
model Staff {
  id    Int    @id
  email String

  @@unique(fields: [email], name: "staffEmail")
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).not.toThrow();
  });
});

describe("assertNoUnsupportedAttributes with @@id", () => {
  it("should reject a composite primary key", () => {
    const schema = `
model Enrollment {
  studentId Int
  courseId  Int

  @@id([studentId, courseId])
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).toThrow(
      "GASsmaUnsupportedAttributeError: `@@id` on Enrollment (studentId, courseId) is not supported.\n" +
        "GASsma cannot declare a composite primary key on a spreadsheet.\n" +
        "Give the model a single `@id` field instead; a many-to-many relation needs no join model, because GASsma generates the through sheet for you.",
    );
  });

  it("should accept a single field @id", () => {
    const schema = `
model Staff {
  id Int @id @default(autoincrement())
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).not.toThrow();
  });
});

describe("assertNoUnsupportedAttributes with @@index", () => {
  it("should reject an index", () => {
    const schema = `
model Staff {
  id   Int    @id
  name String

  @@index([name])
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).toThrow(
      "GASsmaUnsupportedAttributeError: `@@index` on Staff (name) is not supported.\n" +
        "GASsma cannot create an index on a spreadsheet.\n" +
        "Remove it; every query reads the whole sheet either way.",
    );
  });

  it("should reject an index whose field carries a sort option", () => {
    const schema = `
model Staff {
  id   Int    @id
  name String

  @@index([name(sort: Desc)], map: "staff_name")
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).toThrow(
      /Staff \(name\)/,
    );
  });
});

describe("assertNoUnsupportedAttributes with @@fulltext", () => {
  it("should reject a full-text index", () => {
    const schema = `
model Staff {
  id   Int    @id
  bio  String

  @@fulltext([bio])
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).toThrow(
      "GASsmaUnsupportedAttributeError: `@@fulltext` on Staff (bio) is not supported.\n" +
        "GASsma cannot create a full-text index on a spreadsheet.\n" +
        "Remove it; every query reads the whole sheet either way.",
    );
  });
});

describe("assertNoUnsupportedAttributes with native types", () => {
  it("should reject @db.VarChar", () => {
    const schema = `
model Staff {
  id   Int    @id
  name String @db.VarChar(255)
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).toThrow(
      "GASsmaUnsupportedAttributeError: `@db.VarChar` on Staff.name is not supported.\n" +
        "GASsma cannot control how a spreadsheet stores a value, so the native type has no effect.\n" +
        "Remove it.",
    );
  });

  it("should name the native type that was used", () => {
    const schema = `
model Staff {
  id   Int    @id
  bio  String @db.Text
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).toThrow(/@db\.Text/);
  });

  it("should reject a native type under a differently named datasource", () => {
    const schema = `
model Staff {
  id   Int    @id
  name String @sheet.VarChar(255)
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).toThrow(
      /@sheet\.VarChar/,
    );
  });
});

describe("assertNoUnsupportedAttributes with @ignore", () => {
  it("should reject an unsupported attribute on an ignored field", () => {
    const schema = `
model Staff {
  id    Int    @id
  email String @db.VarChar(255) @ignore
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).toThrow(/Staff\.email/);
  });

  it("should reject an unsupported attribute in an ignored model", () => {
    const schema = `
model Staff {
  id    Int    @id
  email String

  @@index([email])
  @@ignore
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).toThrow(
      /Staff \(email\)/,
    );
  });
});

describe("assertNoUnsupportedAttributes with supported schemas", () => {
  it("should accept a schema that uses only supported attributes", () => {
    const schema = `
model Staff {
  id        Int      @id @default(autoincrement())
  email     String   @unique @map("Email Address")
  memo      String   @ignore
  updatedAt DateTime @updatedAt
  shifts    Shift[]

  @@unique([email, memo])
  @@map("staff sheet")
}

model Shift {
  id      Int   @id @default(autoincrement())
  staffId Int
  staff   Staff @relation(fields: [staffId], references: [id])

  @@ignore
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).not.toThrow();
  });

  it("should leave enum declarations alone", () => {
    const schema = `
enum Role {
  ADMIN @map("admin")

  @@map("roles")
}

model Staff {
  id   Int  @id
  role Role
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).not.toThrow();
  });
});

describe("assertNoUnsupportedAttributes with several attributes", () => {
  it("should report all of them in one error", () => {
    const schema = `
model Staff {
  id   Int    @id
  name String @db.VarChar(255)
  bio  String

  @@index([name])
  @@fulltext([bio])
}
`;
    expect(() => assertNoUnsupportedAttributes(schema)).toThrow(/@db\.VarChar/);
    expect(() => assertNoUnsupportedAttributes(schema)).toThrow(/@@index/);
    expect(() => assertNoUnsupportedAttributes(schema)).toThrow(/@@fulltext/);
  });

  it("should carry the violations on the error", () => {
    const schema = `
model Staff {
  id    Int    @id
  email String @db.VarChar(255)
  code  String @db.Text
}
`;
    try {
      assertNoUnsupportedAttributes(schema);
      expect.unreachable("assertNoUnsupportedAttributes did not throw");
    } catch (e) {
      if (!(e instanceof UnsupportedAttributeError)) throw e;
      expect(e.violations.map((violation) => violation.target)).toEqual([
        "Staff.email",
        "Staff.code",
      ]);
      expect(e.violations.map((violation) => violation.attribute)).toEqual([
        "@db.VarChar",
        "@db.Text",
      ]);
    }
  });

  it("should group the targets that share an attribute", () => {
    const schema = `
model Staff {
  id    Int    @id
  email String @db.VarChar(255)
  code  String @db.VarChar(255)

  @@index([email])
}
`;
    try {
      assertNoUnsupportedAttributes(schema);
      expect.unreachable("assertNoUnsupportedAttributes did not throw");
    } catch (e) {
      if (!(e instanceof UnsupportedAttributeError)) throw e;
      expect(e.message).toBe(
        "GASsmaUnsupportedAttributeError: `@db.VarChar` is not supported.\n" +
          "  - Staff.email\n" +
          "  - Staff.code\n" +
          "GASsma cannot control how a spreadsheet stores a value, so the native type has no effect.\n" +
          "Remove it.\n" +
          "\n" +
          "`@@index` on Staff (email) is not supported.\n" +
          "GASsma cannot create an index on a spreadsheet.\n" +
          "Remove it; every query reads the whole sheet either way.",
      );
    }
  });
});
