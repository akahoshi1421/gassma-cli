import { describe, expect, it } from "vitest";
import { validateSchema } from "../../validate/validate";

const generatorBlock = `generator client {
  provider = "prisma-client-js"
  output   = "./generated/gassma"
}`;

describe("validateSchema with @unique", () => {
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

  it("should report one error per violating field", () => {
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

  it("should stay valid without @unique", () => {
    const schema = `${generatorBlock}

model Staff {
  id    Int    @id
  email String
}
`;
    expect(validateSchema(schema).valid).toBe(true);
  });
});
