import { extractMap } from "../../../generate/read/extractMap";

describe("extractMap", () => {
  it("should extract @map fields", () => {
    const schema = `
model User {
  id        Int    @id
  firstName String @map("first_name")
}
`;
    const result = extractMap(schema);
    expect(result).toEqual({
      User: { firstName: "first_name" },
    });
  });

  it("should extract multiple @map fields from one model", () => {
    const schema = `
model User {
  id        Int    @id
  firstName String @map("first_name")
  lastName  String @map("last_name")
}
`;
    const result = extractMap(schema);
    expect(result).toEqual({
      User: { firstName: "first_name", lastName: "last_name" },
    });
  });

  it("should extract from multiple models", () => {
    const schema = `
model User {
  id        Int    @id
  firstName String @map("first_name")
}

model Post {
  id       Int    @id
  postName String @map("post_name")
}
`;
    const result = extractMap(schema);
    expect(result).toEqual({
      User: { firstName: "first_name" },
      Post: { postName: "post_name" },
    });
  });

  it("should return empty object when no @map fields", () => {
    const schema = `
model User {
  id   Int    @id
  name String
}
`;
    const result = extractMap(schema);
    expect(result).toEqual({});
  });

  it("should not confuse @map with @@map", () => {
    const schema = `
model User {
  id   Int    @id
  name String @map("user_name")

  @@map("users")
}
`;
    const result = extractMap(schema);
    expect(result).toEqual({
      User: { name: "user_name" },
    });
  });
});
