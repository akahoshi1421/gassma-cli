import { describe, it, expect } from "vitest";
import { extractOptionalRelations } from "../../../generate/read/extractOptionalRelations";

describe("extractOptionalRelations", () => {
  it("should not collect a required fk-side relation", () => {
    const schema = `
model User {
  id    Int    @id
  posts Post[]
}

model Post {
  id       Int  @id
  authorId Int
  author   User @relation(fields: [authorId], references: [id])
}
`;
    const result = extractOptionalRelations(schema);

    expect(result.Post).not.toContain("author");
  });

  it("should collect an optional fk-side relation", () => {
    const schema = `
model Theme {
  id     Int      @id
  lesson Lesson[]
}

model Lesson {
  id      Int    @id
  themeId Int?
  theme   Theme? @relation(fields: [themeId], references: [id])
}
`;
    const result = extractOptionalRelations(schema);

    expect(result.Lesson).toContain("theme");
  });

  it("should collect a self relation that is optional", () => {
    const schema = `
model Category {
  id       Int        @id
  parentId Int?
  parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children Category[] @relation("CategoryTree")
}
`;
    const result = extractOptionalRelations(schema);

    expect(result.Category).toContain("parent");
    expect(result.Category).not.toContain("children");
  });

  it("should not collect the inverse side that holds no fk", () => {
    const schema = `
model User {
  id      Int      @id
  profile Profile?
}

model Profile {
  id     Int  @id
  userId Int  @unique
  user   User @relation(fields: [userId], references: [id])
}
`;
    const result = extractOptionalRelations(schema);

    expect(result.User).not.toContain("profile");
    expect(result.Profile).not.toContain("user");
  });

  it("should give every model an entry even without relations", () => {
    const schema = `
model Tag {
  id   Int    @id
  name String
}
`;
    const result = extractOptionalRelations(schema);

    expect(result.Tag).toEqual([]);
  });

  it("should collect several optional relations on one model", () => {
    const schema = `
model Member {
  id    Int    @id
  loans Loan[]
}

model Book {
  id    Int    @id
  loans Loan[]
}

model Loan {
  id       Int     @id
  memberId Int
  bookId   Int?
  member   Member  @relation(fields: [memberId], references: [id])
  book     Book?   @relation(fields: [bookId], references: [id])
}
`;
    const result = extractOptionalRelations(schema);

    expect(result.Loan).toEqual(["book"]);
  });
});
