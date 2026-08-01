import { describe, it, expect } from "vitest";
import { IgnoredRelationColumnError } from "../../../error/mainError";
import { extractRelations } from "../../../generate/read/extractRelations";

describe("extractRelations with @ignore columns", () => {
  it("should reject a relation whose fields column has @ignore", () => {
    const schema = `
model User {
  id    Int    @id
  posts Post[]
}

model Post {
  id       Int  @id
  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId Int  @ignore
}
`;
    expect(() => extractRelations(schema)).toThrow(IgnoredRelationColumnError);
    expect(() => extractRelations(schema)).toThrow(/Post\.author/);
    expect(() => extractRelations(schema)).toThrow(/"authorId"/);
    expect(() => extractRelations(schema)).toThrow(/@ignore/);
    expect(() => extractRelations(schema)).toThrow(/onDelete/);
    expect(() => extractRelations(schema)).toThrow(/[Rr]emove/);
  });

  it("should reject a relation whose references column has @ignore", () => {
    const schema = `
model User {
  id    Int    @id @ignore
  posts Post[]
}

model Post {
  id       Int  @id
  author   User @relation(fields: [authorId], references: [id])
  authorId Int
}
`;
    expect(() => extractRelations(schema)).toThrow(IgnoredRelationColumnError);
    expect(() => extractRelations(schema)).toThrow(/"id"/);
    expect(() => extractRelations(schema)).toThrow(/"User"/);
  });

  it("should reject the FK column of a one-to-one relation", () => {
    const schema = `
model User {
  id      Int      @id
  profile Profile?
}

model Profile {
  id     Int  @id
  user   User @relation(fields: [userId], references: [id])
  userId Int  @unique @ignore
}
`;
    expect(() => extractRelations(schema)).toThrow(IgnoredRelationColumnError);
    expect(() => extractRelations(schema)).toThrow(/Profile\.user/);
    expect(() => extractRelations(schema)).toThrow(/"userId"/);
  });

  it("should reject a self relation running on an @ignore column", () => {
    const schema = `
model Category {
  id       Int        @id
  parentId Int?       @ignore
  parent   Category?  @relation("Tree", fields: [parentId], references: [id])
  children Category[] @relation("Tree")
}
`;
    expect(() => extractRelations(schema)).toThrow(IgnoredRelationColumnError);
    expect(() => extractRelations(schema)).toThrow(/"parentId"/);
  });

  it("should reject an implicit manyToMany whose id column has @ignore", () => {
    const schema = `
model Post {
  id   Int   @id @ignore
  tags Tag[]
}

model Tag {
  id    Int    @id
  posts Post[]
}
`;
    expect(() => extractRelations(schema)).toThrow(IgnoredRelationColumnError);
    expect(() => extractRelations(schema)).toThrow(/"Post"/);
    expect(() => extractRelations(schema)).toThrow(/"id"/);
  });

  it("should list every violating column in one error", () => {
    const schema = `
model User {
  id    Int    @id
  posts Post[]
  likes Like[]
}

model Post {
  id       Int  @id
  author   User @relation(fields: [authorId], references: [id])
  authorId Int  @ignore
}

model Like {
  id      Int  @id
  user    User @relation(fields: [userId], references: [id])
  userId  Int  @ignore
}
`;
    expect(() => extractRelations(schema)).toThrow(/authorId/);
    expect(() => extractRelations(schema)).toThrow(/userId/);

    try {
      extractRelations(schema);
      expect.unreachable();
    } catch (e) {
      if (!(e instanceof IgnoredRelationColumnError)) throw e;
      expect(e.details).toHaveLength(2);
    }
  });

  it("should report a column shared by both relation sides only once", () => {
    const schema = `
model User {
  id    Int    @id
  posts Post[]
}

model Post {
  id       Int  @id
  author   User @relation(fields: [authorId], references: [id])
  authorId Int  @ignore
}
`;
    try {
      extractRelations(schema);
      expect.unreachable();
    } catch (e) {
      if (!(e instanceof IgnoredRelationColumnError)) throw e;
      expect(e.details).toHaveLength(1);
    }
  });

  it("should accept @ignore on a column no relation uses", () => {
    const schema = `
model User {
  id     Int    @id
  secret String @ignore
  posts  Post[]
}

model Post {
  id       Int    @id
  draft    String @ignore
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId Int
}
`;
    expect(() => extractRelations(schema)).not.toThrow();
  });

  it("should accept a schema with relations and no @ignore at all", () => {
    const schema = `
model User {
  id    Int    @id
  posts Post[]
}

model Post {
  id       Int  @id
  author   User @relation(fields: [authorId], references: [id])
  authorId Int
}
`;
    expect(() => extractRelations(schema)).not.toThrow();
  });

  it("should accept @ignore on the relation field itself", () => {
    const schema = `
model User {
  id    Int    @id
  posts Post[]
}

model Post {
  id       Int  @id
  author   User @relation(fields: [authorId], references: [id]) @ignore
  authorId Int
}
`;
    expect(() => extractRelations(schema)).not.toThrow();
  });

  it("should accept an implicit manyToMany when only a non-id column has @ignore", () => {
    const schema = `
model Post {
  id    Int    @id
  draft String @ignore
  tags  Tag[]
}

model Tag {
  id    Int    @id
  memo  String @ignore
  posts Post[]
}
`;
    expect(() => extractRelations(schema)).not.toThrow();
  });

  it("should accept an explicit junction model with clean FK columns", () => {
    const schema = `
model Post {
  id       Int       @id
  postTags PostTag[]
}

model Tag {
  id       Int       @id
  postTags PostTag[]
}

model PostTag {
  postId Int
  tagId  Int
  note   String @ignore
  post   Post @relation(fields: [postId], references: [id])
  tag    Tag  @relation(fields: [tagId], references: [id])

  @@id([postId, tagId])
}
`;
    expect(() => extractRelations(schema)).not.toThrow();
  });

  it("should reject an explicit junction model whose FK column has @ignore", () => {
    const schema = `
model Post {
  id       Int       @id
  postTags PostTag[]
}

model Tag {
  id       Int       @id
  postTags PostTag[]
}

model PostTag {
  postId Int @ignore
  tagId  Int
  post   Post @relation(fields: [postId], references: [id])
  tag    Tag  @relation(fields: [tagId], references: [id])

  @@id([postId, tagId])
}
`;
    expect(() => extractRelations(schema)).toThrow(IgnoredRelationColumnError);
    expect(() => extractRelations(schema)).toThrow(/PostTag\.post/);
    expect(() => extractRelations(schema)).toThrow(/"postId"/);
  });
});
