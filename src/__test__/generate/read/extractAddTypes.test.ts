import { extractAddTypes } from "../../../generate/read/extractAddTypes";

describe("extractAddTypes", () => {
  it("should extract addType for a field", () => {
    const schema = `
model User {
  /// @gassma.addType string
  id Int @id
}
`;
    const result = extractAddTypes(schema);

    expect(result).toEqual({
      User: { id: ["string"] },
    });
  });

  it("should extract multiple addTypes with comma separation", () => {
    const schema = `
model User {
  /// @gassma.addType string, boolean
  id Int @id
}
`;
    const result = extractAddTypes(schema);

    expect(result).toEqual({
      User: { id: ["string", "boolean"] },
    });
  });

  it("should return empty object when no addType comments exist", () => {
    const schema = `
model User {
  id Int @id
  name String
}
`;
    const result = extractAddTypes(schema);

    expect(result).toEqual({});
  });

  it("should handle multiple fields with addType", () => {
    const schema = `
model User {
  /// @gassma.addType string
  id Int @id
  /// @gassma.addType number
  name String
}
`;
    const result = extractAddTypes(schema);

    expect(result).toEqual({
      User: {
        id: ["string"],
        name: ["number"],
      },
    });
  });

  it("should handle multiple models", () => {
    const schema = `
model User {
  /// @gassma.addType string
  id Int @id
}

model Post {
  /// @gassma.addType boolean
  title String
}
`;
    const result = extractAddTypes(schema);

    expect(result).toEqual({
      User: { id: ["string"] },
      Post: { title: ["boolean"] },
    });
  });

  it("should strip quotes from addType values", () => {
    const schema = `
model Order {
  /// @gassma.addType "pending", "shipped", "delivered"
  status String
}
`;
    const result = extractAddTypes(schema);

    expect(result).toEqual({
      Order: { status: ["pending", "shipped", "delivered"] },
    });
  });

  it("should handle mixed quoted and unquoted addType values", () => {
    const schema = `
model Post {
  /// @gassma.addType number, "draft"
  content String
}
`;
    const result = extractAddTypes(schema);

    expect(result).toEqual({
      Post: { content: ["number", "draft"] },
    });
  });

  it("should ignore regular comments", () => {
    const schema = `
model User {
  /// This is a regular comment
  id Int @id
}
`;
    const result = extractAddTypes(schema);

    expect(result).toEqual({});
  });
});
