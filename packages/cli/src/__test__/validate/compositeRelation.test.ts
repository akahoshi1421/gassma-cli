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

describe("validateSchema with a composite foreign key", () => {
  it("should report compositeRelation", () => {
    const schema = `${generatorBlock}

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
    const result = validateSchema(schema);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      type: "compositeRelation",
      message:
        "`@relation` on Shift.staff spans more than one column " +
        "(fields: [staffFirstName, staffLastName], references: [firstName, lastName]), " +
        "which is not supported yet. " +
        "GASsma matches a relation on a single column for now, so the columns after the first are dropped " +
        "and rows that agree on the first column alone would match. " +
        "Please narrow the relation to one column until composite keys are supported.",
    });
  });

  it("should report one error per composite relation", () => {
    const schema = `${generatorBlock}

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
    const compositeErrors = validateSchema(schema).errors.filter(
      (error) => error.type === "compositeRelation",
    );

    expect(compositeErrors).toHaveLength(2);
    expect(messagesOf(schema)).toContain("Shift.staff");
    expect(messagesOf(schema)).toContain("Review.staff");
  });

  it("should stay valid for a single column relation", () => {
    const schema = `${generatorBlock}

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
    expect(validateSchema(schema)).toEqual({ valid: true, errors: [] });
  });

  it("should stay valid for a one-to-one whose foreign key is a single @unique column", () => {
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
});
