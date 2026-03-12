import { extractIgnoreSheets } from "../../../generate/read/extractIgnoreSheets";

describe("extractIgnoreSheets", () => {
  it("should extract @@ignore models", () => {
    const schema = `
model User {
  id   Int    @id
  name String
}

model InternalLog {
  id      Int    @id
  message String

  @@ignore
}
`;
    const result = extractIgnoreSheets(schema);
    expect(result).toEqual(["InternalLog"]);
  });

  it("should extract multiple @@ignore models", () => {
    const schema = `
model User {
  id   Int    @id
  name String
}

model TempData {
  id   Int    @id
  data String

  @@ignore
}

model DebugLog {
  id      Int    @id
  message String

  @@ignore
}
`;
    const result = extractIgnoreSheets(schema);
    expect(result).toEqual(["TempData", "DebugLog"]);
  });

  it("should return empty array when no @@ignore models", () => {
    const schema = `
model User {
  id   Int    @id
  name String
}
`;
    const result = extractIgnoreSheets(schema);
    expect(result).toEqual([]);
  });

  it("should not confuse @@ignore with @ignore", () => {
    const schema = `
model User {
  id       Int    @id
  name     String
  internal String @ignore
}
`;
    const result = extractIgnoreSheets(schema);
    expect(result).toEqual([]);
  });
});
