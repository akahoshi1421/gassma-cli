import { describe, expect, it } from "vitest";
import { UnsupportedAttributeError } from "../../../error/mainError";
import { assertNoUniqueAttributes } from "../../../generate/read/assertNoUniqueAttributes";

describe("assertNoUniqueAttributes", () => {
  it("should reject a field marked @unique", () => {
    const schema = `
model Staff {
  id    Int    @id
  email String @unique
}
`;
    expect(() => assertNoUniqueAttributes(schema)).toThrow(
      UnsupportedAttributeError,
    );
  });

  it("should name the model and the field", () => {
    const schema = `
model Staff {
  id    Int    @id
  email String @unique
}
`;
    expect(() => assertNoUniqueAttributes(schema)).toThrow(
      "GASsmaUnsupportedAttributeError: `@unique` on Staff.email is not supported.\n" +
        "GASsma cannot enforce uniqueness on a spreadsheet.\n" +
        "Remove it, or check uniqueness in your code.",
    );
  });

  it("should report every violating field at once", () => {
    const schema = `
model Staff {
  id    Int    @id
  email String @unique
  code  String @unique
}

model Shift {
  id   Int    @id
  slug String @unique
}
`;
    expect(() => assertNoUniqueAttributes(schema)).toThrow(/Staff\.email/);
    expect(() => assertNoUniqueAttributes(schema)).toThrow(/Staff\.code/);
    expect(() => assertNoUniqueAttributes(schema)).toThrow(/Shift\.slug/);
  });

  it("should carry the violating fields on the error", () => {
    const schema = `
model Staff {
  id    Int    @id
  email String @unique
  code  String @unique
}
`;
    try {
      assertNoUniqueAttributes(schema);
      expect.unreachable("assertNoUniqueAttributes did not throw");
    } catch (e) {
      if (!(e instanceof UnsupportedAttributeError)) throw e;
      expect(e.fields).toEqual(["Staff.email", "Staff.code"]);
    }
  });

  it("should reject @unique combined with other attributes", () => {
    const schema = `
model Staff {
  id    Int    @id
  email String @unique @map("Email Address")
}
`;
    expect(() => assertNoUniqueAttributes(schema)).toThrow(/Staff\.email/);
  });

  it("should accept a schema without @unique", () => {
    const schema = `
model Staff {
  id    Int    @id
  email String
}
`;
    expect(() => assertNoUniqueAttributes(schema)).not.toThrow();
  });

  it("should leave @@unique alone", () => {
    const schema = `
model Staff {
  id    Int    @id
  email String

  @@unique([email])
}
`;
    expect(() => assertNoUniqueAttributes(schema)).not.toThrow();
  });

  it("should not be fooled by a field named unique", () => {
    const schema = `
model Staff {
  id     Int    @id
  unique String
}
`;
    expect(() => assertNoUniqueAttributes(schema)).not.toThrow();
  });
});
