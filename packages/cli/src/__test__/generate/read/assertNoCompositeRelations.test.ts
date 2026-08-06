import { describe, expect, it } from "vitest";
import { CompositeRelationError } from "../../../error/mainError";
import { assertNoCompositeRelations } from "../../../generate/read/assertNoCompositeRelations";

const compositeOneToMany = `
model Staff {
  id        Int     @id
  firstName String
  lastName  String
  shifts    Shift[]

  @@unique([firstName, lastName])
}

model Shift {
  id             Int   @id
  staffFirstName String
  staffLastName  String
  staff          Staff @relation(fields: [staffFirstName, staffLastName], references: [firstName, lastName])
}
`;

describe("assertNoCompositeRelations", () => {
  it("should reject a relation whose fields span more than one column", () => {
    expect(() => assertNoCompositeRelations(compositeOneToMany)).toThrow(
      CompositeRelationError,
    );
  });

  it("should name the model and the field that carries it", () => {
    expect(() => assertNoCompositeRelations(compositeOneToMany)).toThrow(
      "GASsmaCompositeRelationError: `@relation` over more than one column is not supported yet.\n" +
        "  - Shift.staff (fields: [staffFirstName, staffLastName], references: [firstName, lastName])\n" +
        "GASsma matches a relation on a single column for now, so the columns after the first are dropped and rows that agree on the first column alone would match.\n" +
        "Please narrow the relation to one column until composite keys are supported.",
    );
  });

  it("should reject a composite one-to-one", () => {
    const schema = `
model Staff {
  id        Int      @id
  firstName String
  lastName  String
  profile   Profile?

  @@unique([firstName, lastName])
}

model Profile {
  id             Int   @id
  staffFirstName String
  staffLastName  String
  staff          Staff @relation(fields: [staffFirstName, staffLastName], references: [firstName, lastName])

  @@unique([staffFirstName, staffLastName])
}
`;
    expect(() => assertNoCompositeRelations(schema)).toThrow(
      /Profile\.staff \(fields: \[staffFirstName, staffLastName\]/,
    );
  });

  it("should reject a relation whose references alone span more than one column", () => {
    const schema = `
model Staff {
  id     Int     @id
  code   String
  shifts Shift[]
}

model Shift {
  id      Int   @id
  staffId Int
  staff   Staff @relation(fields: [staffId], references: [id, code])
}
`;
    expect(() => assertNoCompositeRelations(schema)).toThrow(
      /references: \[id, code\]/,
    );
  });

  it("should report every composite relation at once", () => {
    const schema = `
model Staff {
  id        Int       @id
  firstName String
  lastName  String
  shifts    Shift[]
  reviews   Review[]
}

model Shift {
  id             Int   @id
  staffFirstName String
  staffLastName  String
  staff          Staff @relation(fields: [staffFirstName, staffLastName], references: [firstName, lastName])
}

model Review {
  id             Int   @id
  staffFirstName String
  staffLastName  String
  staff          Staff @relation(fields: [staffFirstName, staffLastName], references: [firstName, lastName])
}
`;
    expect(() => assertNoCompositeRelations(schema)).toThrow(/Shift\.staff/);
    expect(() => assertNoCompositeRelations(schema)).toThrow(/Review\.staff/);
  });

  it("should carry the violations on the error", () => {
    try {
      assertNoCompositeRelations(compositeOneToMany);
      expect.unreachable("assertNoCompositeRelations did not throw");
    } catch (e) {
      if (!(e instanceof CompositeRelationError)) throw e;
      expect(e.violations.map((violation) => violation.target)).toEqual([
        "Shift.staff",
      ]);
      expect(e.violations.map((violation) => violation.columns)).toEqual([
        "fields: [staffFirstName, staffLastName], references: [firstName, lastName]",
      ]);
    }
  });

  it("should say the support is still to come rather than impossible", () => {
    expect(() => assertNoCompositeRelations(compositeOneToMany)).toThrow(
      /not supported yet/,
    );
  });

  it("should accept a single column relation", () => {
    const schema = `
model Staff {
  id     Int     @id
  shifts Shift[]
}

model Shift {
  id      Int   @id
  staffId Int
  staff   Staff @relation(fields: [staffId], references: [id])
}
`;
    expect(() => assertNoCompositeRelations(schema)).not.toThrow();
  });

  it("should accept a single column relation that carries other arguments", () => {
    const schema = `
model Staff {
  id     Int     @id
  shifts Shift[]
}

model Shift {
  id      Int   @id
  staffId Int
  staff   Staff @relation("StaffShifts", fields: [staffId], references: [id], onDelete: Cascade, onUpdate: Cascade)
}
`;
    expect(() => assertNoCompositeRelations(schema)).not.toThrow();
  });

  it("should accept the inverse side that names no fields", () => {
    const schema = `
model Staff {
  id     Int     @id
  shifts Shift[] @relation("StaffShifts")
}

model Shift {
  id      Int   @id
  staffId Int
  staff   Staff @relation("StaffShifts", fields: [staffId], references: [id])
}
`;
    expect(() => assertNoCompositeRelations(schema)).not.toThrow();
  });

  it("should accept an implicit many-to-many", () => {
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
    expect(() => assertNoCompositeRelations(schema)).not.toThrow();
  });

  it("should leave enum declarations alone", () => {
    const schema = `
enum Role {
  ADMIN
  USER
}

model Staff {
  id   Int  @id
  role Role
}
`;
    expect(() => assertNoCompositeRelations(schema)).not.toThrow();
  });
});
