import {
  extractAddTypes,
  extractReplaceTypes,
} from "../../../generate/read/extractAddTypes";

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

describe("extractReplaceTypes", () => {
  it("should extract replaceType for a field", () => {
    const schema = `
model User {
  /// @gassma.replaceType "admin", "user"
  role String
}
`;
    const result = extractReplaceTypes(schema);

    expect(result).toEqual({
      User: { role: ["admin", "user"] },
    });
  });

  it("should extract single replaceType value", () => {
    const schema = `
model Order {
  /// @gassma.replaceType "pending", "shipped", "delivered"
  status String
}
`;
    const result = extractReplaceTypes(schema);

    expect(result).toEqual({
      Order: { status: ["pending", "shipped", "delivered"] },
    });
  });

  it("should return empty object when no replaceType comments exist", () => {
    const schema = `
model User {
  id Int @id
  name String
}
`;
    const result = extractReplaceTypes(schema);

    expect(result).toEqual({});
  });

  it("should handle multiple models with replaceType", () => {
    const schema = `
model User {
  /// @gassma.replaceType "admin", "user"
  role String
}

model Order {
  /// @gassma.replaceType "pending", "shipped"
  status String
}
`;
    const result = extractReplaceTypes(schema);

    expect(result).toEqual({
      User: { role: ["admin", "user"] },
      Order: { status: ["pending", "shipped"] },
    });
  });

  it("should not interfere with addType", () => {
    const schema = `
model User {
  /// @gassma.addType boolean
  id Int @id
  /// @gassma.replaceType "admin", "user"
  role String
}
`;
    const addResult = extractAddTypes(schema);
    const replaceResult = extractReplaceTypes(schema);

    expect(addResult).toEqual({ User: { id: ["boolean"] } });
    expect(replaceResult).toEqual({ User: { role: ["admin", "user"] } });
  });
});
