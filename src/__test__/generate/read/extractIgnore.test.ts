import { extractIgnore } from "../../../generate/read/extractIgnore";

describe("extractIgnore", () => {
  it("should extract @ignore fields", () => {
    const schema = `
model User {
  id       Int    @id
  name     String
  internal String @ignore
}
`;
    const result = extractIgnore(schema);
    expect(result).toEqual({
      User: ["internal"],
    });
  });

  it("should extract multiple @ignore fields from one model", () => {
    const schema = `
model Post {
  id       Int    @id
  title    String
  tempData String @ignore
  debugLog String @ignore
}
`;
    const result = extractIgnore(schema);
    expect(result).toEqual({
      Post: ["tempData", "debugLog"],
    });
  });

  it("should extract from multiple models", () => {
    const schema = `
model User {
  id       Int    @id
  internal String @ignore
}

model Post {
  id      Int    @id
  tmpFlag String @ignore
}
`;
    const result = extractIgnore(schema);
    expect(result).toEqual({
      User: ["internal"],
      Post: ["tmpFlag"],
    });
  });

  it("should return empty object when no @ignore fields", () => {
    const schema = `
model User {
  id   Int    @id
  name String
}
`;
    const result = extractIgnore(schema);
    expect(result).toEqual({});
  });

  it("should not confuse @ignore with other attributes", () => {
    const schema = `
model User {
  id        Int      @id
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  internal  String   @ignore
}
`;
    const result = extractIgnore(schema);
    expect(result).toEqual({
      User: ["internal"],
    });
  });
});
