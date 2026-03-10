import { extractEnums } from "../../../generate/read/extractEnums";

describe("extractEnums", () => {
  it("should extract enum values", () => {
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
      Role: ["ADMIN", "USER", "MODERATOR"],
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
      Role: ["ADMIN", "USER"],
      Status: ["ACTIVE", "INACTIVE"],
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
