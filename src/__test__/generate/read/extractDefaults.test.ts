import { extractDefaults } from "../../../generate/read/extractDefaults";

describe("extractDefaults", () => {
  it("should extract static boolean default", () => {
    const schema = `
model User {
  id       Int     @id
  isActive Boolean @default(true)
}
`;
    const result = extractDefaults(schema);

    expect(result).toEqual({
      User: { isActive: { kind: "static", value: true } },
    });
  });

  it("should extract static number default", () => {
    const schema = `
model Post {
  id        Int @id
  viewCount Int @default(0)
}
`;
    const result = extractDefaults(schema);

    expect(result).toEqual({
      Post: { viewCount: { kind: "static", value: 0 } },
    });
  });

  it("should extract now() function default", () => {
    const schema = `
model User {
  id        Int      @id
  createdAt DateTime @default(now())
}
`;
    const result = extractDefaults(schema);

    expect(result).toEqual({
      User: { createdAt: { kind: "function", name: "now" } },
    });
  });

  it("should extract uuid() function default", () => {
    const schema = `
model User {
  id   String @id @default(uuid())
  name String
}
`;
    const result = extractDefaults(schema);

    expect(result).toEqual({
      User: { id: { kind: "function", name: "uuid" } },
    });
  });

  it("should skip autoincrement()", () => {
    const schema = `
model User {
  id   Int    @id @default(autoincrement())
  name String
}
`;
    const result = extractDefaults(schema);

    expect(result).toEqual({});
  });

  it("should extract multiple defaults from one model", () => {
    const schema = `
model Post {
  id        Int      @id @default(autoincrement())
  published Boolean  @default(false)
  viewCount Int      @default(0)
  createdAt DateTime @default(now())
}
`;
    const result = extractDefaults(schema);

    expect(result).toEqual({
      Post: {
        published: { kind: "static", value: false },
        viewCount: { kind: "static", value: 0 },
        createdAt: { kind: "function", name: "now" },
      },
    });
  });

  it("should extract defaults from multiple models", () => {
    const schema = `
model User {
  id        Int      @id
  isActive  Boolean  @default(true)
}

model Post {
  id        Int      @id
  published Boolean  @default(false)
}
`;
    const result = extractDefaults(schema);

    expect(result).toEqual({
      User: { isActive: { kind: "static", value: true } },
      Post: { published: { kind: "static", value: false } },
    });
  });

  it("should return empty object when no defaults exist", () => {
    const schema = `
model User {
  id   Int    @id
  name String
}
`;
    const result = extractDefaults(schema);

    expect(result).toEqual({});
  });

  it("should extract static string default", () => {
    const schema = `
model User {
  id   Int    @id
  role String @default("USER")
}
`;
    const result = extractDefaults(schema);

    expect(result).toEqual({
      User: { role: { kind: "static", value: "USER" } },
    });
  });
});
