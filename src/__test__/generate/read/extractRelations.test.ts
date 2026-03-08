import { extractRelations } from "../../../generate/read/extractRelations";

describe("extractRelations", () => {
  it("should extract oneToMany relation", () => {
    const schema = `
model User {
  id    Int    @id
  name  String
  posts Post[]
}

model Post {
  id       Int    @id
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int
}
`;
    const result = extractRelations(schema);

    expect(result).toEqual({
      User: {
        posts: {
          type: "oneToMany",
          to: "Post",
          field: "id",
          reference: "authorId",
        },
      },
      Post: {
        author: {
          type: "manyToOne",
          to: "User",
          field: "authorId",
          reference: "id",
        },
      },
    });
  });

  it("should extract oneToOne relation", () => {
    const schema = `
model User {
  id      Int      @id
  profile Profile?
}

model Profile {
  id     Int  @id
  user   User @relation(fields: [userId], references: [id])
  userId Int  @unique
}
`;
    const result = extractRelations(schema);

    expect(result).toEqual({
      User: {
        profile: {
          type: "oneToOne",
          to: "Profile",
          field: "id",
          reference: "userId",
        },
      },
      Profile: {
        user: {
          type: "oneToOne",
          to: "User",
          field: "userId",
          reference: "id",
        },
      },
    });
  });

  it("should return empty object when no relations exist", () => {
    const schema = `
model User {
  id   Int    @id
  name String
}
`;
    const result = extractRelations(schema);

    expect(result).toEqual({});
  });

  it("should extract onDelete and onUpdate actions", () => {
    const schema = `
model User {
  id    Int    @id
  posts Post[]
}

model Post {
  id       Int    @id
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade, onUpdate: SetNull)
  authorId Int
}
`;
    const result = extractRelations(schema);

    expect(result.Post.author.onDelete).toBe("Cascade");
    expect(result.Post.author.onUpdate).toBe("SetNull");
  });

  it("should handle multiple relations on the same model", () => {
    const schema = `
model User {
  id             Int    @id
  writtenPosts   Post[] @relation("WrittenPosts")
  favoritePosts  Post[] @relation("FavoritePosts")
}

model Post {
  id          Int    @id
  author      User   @relation("WrittenPosts", fields: [authorId], references: [id])
  authorId    Int
  favoritedBy User?  @relation("FavoritePosts", fields: [favoritedById], references: [id])
  favoritedById Int?
}
`;
    const result = extractRelations(schema);

    expect(result.User.writtenPosts).toEqual({
      type: "oneToMany",
      to: "Post",
      field: "id",
      reference: "authorId",
    });
    expect(result.User.favoritePosts).toEqual({
      type: "oneToMany",
      to: "Post",
      field: "id",
      reference: "favoritedById",
    });
    expect(result.Post.author).toEqual({
      type: "manyToOne",
      to: "User",
      field: "authorId",
      reference: "id",
    });
  });

  it("should extract implicit manyToMany relation", () => {
    const schema = `
model Post {
  id    Int    @id
  title String
  tags  Tag[]
}

model Tag {
  id    Int    @id
  name  String
  posts Post[]
}
`;
    const result = extractRelations(schema);

    expect(result.Post.tags).toEqual({
      type: "manyToMany",
      to: "Tag",
      field: "id",
      reference: "id",
      through: {
        sheet: "_PostToTag",
        field: "postId",
        reference: "tagId",
      },
    });
    expect(result.Tag.posts).toEqual({
      type: "manyToMany",
      to: "Post",
      field: "id",
      reference: "id",
      through: {
        sheet: "_PostToTag",
        field: "tagId",
        reference: "postId",
      },
    });
  });

  it("should sort implicit manyToMany table name alphabetically", () => {
    const schema = `
model Zebra {
  id    Int    @id
  apples Apple[]
}

model Apple {
  id     Int    @id
  zebras Zebra[]
}
`;
    const result = extractRelations(schema);

    expect(result.Zebra.apples.through).toEqual({
      sheet: "_AppleToZebra",
      field: "zebraId",
      reference: "appleId",
    });
    expect(result.Apple.zebras.through).toEqual({
      sheet: "_AppleToZebra",
      field: "appleId",
      reference: "zebraId",
    });
  });

  it("should extract self-referencing oneToMany relation", () => {
    const schema = `
model Category {
  id       Int        @id @default(autoincrement())
  name     String
  parentId Int?
  parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children Category[] @relation("CategoryTree")
}
`;
    const result = extractRelations(schema);

    expect(result.Category.parent).toEqual({
      type: "manyToOne",
      to: "Category",
      field: "parentId",
      reference: "id",
    });
    expect(result.Category.children).toEqual({
      type: "oneToMany",
      to: "Category",
      field: "id",
      reference: "parentId",
    });
  });

  it("should extract manyToMany relation with through table", () => {
    const schema = `
model Post {
  id       Int       @id
  title    String
  postTags PostTag[]
}

model Tag {
  id       Int       @id
  name     String
  postTags PostTag[]
}

model PostTag {
  postId Int
  tagId  Int
  post   Post @relation(fields: [postId], references: [id])
  tag    Tag  @relation(fields: [tagId], references: [id])

  @@id([postId, tagId])
}
`;
    const result = extractRelations(schema);

    expect(result.Post.postTags).toEqual({
      type: "oneToMany",
      to: "PostTag",
      field: "id",
      reference: "postId",
    });
    expect(result.Tag.postTags).toEqual({
      type: "oneToMany",
      to: "PostTag",
      field: "id",
      reference: "tagId",
    });
    expect(result.PostTag.post).toEqual({
      type: "manyToOne",
      to: "Post",
      field: "postId",
      reference: "id",
    });
    expect(result.PostTag.tag).toEqual({
      type: "manyToOne",
      to: "Tag",
      field: "tagId",
      reference: "id",
    });
  });
});
