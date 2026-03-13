import { extractAutoincrement } from "../../../generate/read/extractAutoincrement";

describe("extractAutoincrement", () => {
  it("should extract @default(autoincrement()) fields", () => {
    const schema = `
model User {
  id   Int    @id @default(autoincrement())
  name String
}
`;
    const result = extractAutoincrement(schema);
    expect(result).toEqual({
      User: ["id"],
    });
  });

  it("should extract from multiple models", () => {
    const schema = `
model User {
  id   Int    @id @default(autoincrement())
  name String
}

model Post {
  id    Int    @id @default(autoincrement())
  title String
}
`;
    const result = extractAutoincrement(schema);
    expect(result).toEqual({
      User: ["id"],
      Post: ["id"],
    });
  });

  it("should return empty object when no autoincrement fields", () => {
    const schema = `
model User {
  id   Int    @id
  name String
}
`;
    const result = extractAutoincrement(schema);
    expect(result).toEqual({});
  });

  it("should not confuse autoincrement with other @default functions", () => {
    const schema = `
model User {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  name      String
}
`;
    const result = extractAutoincrement(schema);
    expect(result).toEqual({
      User: ["id"],
    });
  });

  it("should not confuse autoincrement with static defaults", () => {
    const schema = `
model User {
  id       Int     @id @default(autoincrement())
  isActive Boolean @default(true)
}
`;
    const result = extractAutoincrement(schema);
    expect(result).toEqual({
      User: ["id"],
    });
  });
});
