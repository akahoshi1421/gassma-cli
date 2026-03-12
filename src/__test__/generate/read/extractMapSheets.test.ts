import { extractMapSheets } from "../../../generate/read/extractMapSheets";

describe("extractMapSheets", () => {
  it("should extract @@map models", () => {
    const schema = `
model User {
  id   Int    @id
  name String

  @@map("users")
}
`;
    const result = extractMapSheets(schema);
    expect(result).toEqual({ User: "users" });
  });

  it("should extract multiple @@map models", () => {
    const schema = `
model User {
  id   Int    @id
  name String

  @@map("users")
}

model Post {
  id    Int    @id
  title String

  @@map("posts")
}
`;
    const result = extractMapSheets(schema);
    expect(result).toEqual({ User: "users", Post: "posts" });
  });

  it("should return empty object when no @@map models", () => {
    const schema = `
model User {
  id   Int    @id
  name String
}
`;
    const result = extractMapSheets(schema);
    expect(result).toEqual({});
  });

  it("should not confuse @@map with @map", () => {
    const schema = `
model User {
  id   Int    @id
  name String @map("user_name")
}
`;
    const result = extractMapSheets(schema);
    expect(result).toEqual({});
  });

  it("should handle @@map and @map together", () => {
    const schema = `
model User {
  id   Int    @id
  name String @map("user_name")

  @@map("users")
}
`;
    const result = extractMapSheets(schema);
    expect(result).toEqual({ User: "users" });
  });
});
