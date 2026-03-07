import { extractOutputPath } from "../../../generate/read/extractOutputPath";

describe("extractOutputPath", () => {
  it("should extract output path from generator block", () => {
    const schema = `
generator client {
  provider = "prisma-client-js"
  output   = "./generated/gassma"
}

model User {
  id   Int    @id
  name String
}
`;
    expect(extractOutputPath(schema)).toBe("./generated/gassma");
  });

  it("should return null when no generator block exists", () => {
    const schema = `
model User {
  id   Int    @id
  name String
}
`;
    expect(extractOutputPath(schema)).toBeNull();
  });

  it("should return null when generator has no output field", () => {
    const schema = `
generator client {
  provider = "prisma-client-js"
}

model User {
  id   Int    @id
  name String
}
`;
    expect(extractOutputPath(schema)).toBeNull();
  });

  it("should use the first generator with output if multiple exist", () => {
    const schema = `
generator client {
  provider = "prisma-client-js"
  output   = "./generated/first"
}

generator other {
  provider = "something"
  output   = "./generated/second"
}

model User {
  id   Int    @id
  name String
}
`;
    expect(extractOutputPath(schema)).toBe("./generated/first");
  });
});
