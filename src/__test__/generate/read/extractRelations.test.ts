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
});
