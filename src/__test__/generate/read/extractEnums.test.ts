import { extractEnums } from "../../../generate/read/extractEnums";

describe("extractEnums", () => {
  it("should extract enum entries without @map", () => {
    const schema = `
enum Role {
  ADMIN
  USER
  MODERATOR
}

model User {
  id   Int  @id
  role Role
}
`;
    const result = extractEnums(schema);

    expect(result).toEqual({
      Role: [
        { name: "ADMIN", value: "ADMIN" },
        { name: "USER", value: "USER" },
        { name: "MODERATOR", value: "MODERATOR" },
      ],
    });
  });

  it("should extract multiple enums", () => {
    const schema = `
enum Role {
  ADMIN
  USER
}

enum Status {
  ACTIVE
  INACTIVE
}

model User {
  id     Int    @id
  role   Role
  status Status
}
`;
    const result = extractEnums(schema);

    expect(result).toEqual({
      Role: [
        { name: "ADMIN", value: "ADMIN" },
        { name: "USER", value: "USER" },
      ],
      Status: [
        { name: "ACTIVE", value: "ACTIVE" },
        { name: "INACTIVE", value: "INACTIVE" },
      ],
    });
  });

  it("should use @map value when present", () => {
    const schema = `
enum Role {
  admin     @map("ADMIN")
  user      @map("USER")
  moderator @map("MODERATOR")
}

model User {
  id   Int  @id
  role Role
}
`;
    const result = extractEnums(schema);

    expect(result).toEqual({
      Role: [
        { name: "admin", value: "ADMIN" },
        { name: "user", value: "USER" },
        { name: "moderator", value: "MODERATOR" },
      ],
    });
  });

  it("should mix @map and non-@map values", () => {
    const schema = `
enum Role {
  admin     @map("ADMIN")
  USER
  moderator @map("MOD")
}

model User {
  id   Int  @id
  role Role
}
`;
    const result = extractEnums(schema);

    expect(result).toEqual({
      Role: [
        { name: "admin", value: "ADMIN" },
        { name: "USER", value: "USER" },
        { name: "moderator", value: "MOD" },
      ],
    });
  });

  it("should return empty object when no enums exist", () => {
    const schema = `
model User {
  id   Int    @id
  name String
}
`;
    const result = extractEnums(schema);

    expect(result).toEqual({});
  });
});
