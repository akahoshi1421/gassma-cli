import { extractUpdatedAt } from "../../../generate/read/extractUpdatedAt";

describe("extractUpdatedAt", () => {
  it("should extract @updatedAt fields", () => {
    const schema = `
model User {
  id        Int      @id
  name      String
  updatedAt DateTime @updatedAt
}
`;
    const result = extractUpdatedAt(schema);
    expect(result).toEqual({
      User: ["updatedAt"],
    });
  });

  it("should extract multiple @updatedAt fields from one model", () => {
    const schema = `
model Post {
  id         Int      @id
  updatedAt  DateTime @updatedAt
  modifiedAt DateTime @updatedAt
}
`;
    const result = extractUpdatedAt(schema);
    expect(result).toEqual({
      Post: ["updatedAt", "modifiedAt"],
    });
  });

  it("should extract from multiple models", () => {
    const schema = `
model User {
  id        Int      @id
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id
  updatedAt DateTime @updatedAt
}
`;
    const result = extractUpdatedAt(schema);
    expect(result).toEqual({
      User: ["updatedAt"],
      Post: ["updatedAt"],
    });
  });

  it("should return empty object when no @updatedAt fields", () => {
    const schema = `
model User {
  id   Int    @id
  name String
}
`;
    const result = extractUpdatedAt(schema);
    expect(result).toEqual({});
  });

  it("should not confuse @updatedAt with @default(now())", () => {
    const schema = `
model User {
  id        Int      @id
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
    const result = extractUpdatedAt(schema);
    expect(result).toEqual({
      User: ["updatedAt"],
    });
  });
});
