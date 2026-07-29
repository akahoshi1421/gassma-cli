import { describe, it, expect } from "vitest";
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

  it("should type the FK side of a 1:1 relation as manyToOne and the inverse as oneToOne", () => {
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
          type: "manyToOne",
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

    expect(result.Post.author.onDelete).toBeUndefined();
    expect(result.Post.author.onUpdate).toBeUndefined();

    expect(result.User.posts.onDelete).toBe("Cascade");
    expect(result.User.posts.onUpdate).toBe("SetNull");
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

  it("should name the through sheet after the named relation", () => {
    const schema = `
model User {
  id         Int    @id
  follows    User[] @relation("Follows")
  followedBy User[] @relation("Follows")
}
`;
    const result = extractRelations(schema);

    expect(result.User.follows.through).toEqual({
      sheet: "_Follows",
      field: "userBId",
      reference: "userAId",
    });
    expect(result.User.followedBy.through).toEqual({
      sheet: "_Follows",
      field: "userAId",
      reference: "userBId",
    });
  });

  it("should split two named relations on the same pair into distinct sheets", () => {
    const schema = `
model User {
  id         Int    @id
  follows    User[] @relation("Follows")
  followedBy User[] @relation("Follows")
  blocks     User[] @relation("Blocks")
  blockedBy  User[] @relation("Blocks")
}
`;
    const result = extractRelations(schema);

    expect(result.User.follows.through).toEqual({
      sheet: "_Follows",
      field: "userBId",
      reference: "userAId",
    });
    expect(result.User.followedBy.through).toEqual({
      sheet: "_Follows",
      field: "userAId",
      reference: "userBId",
    });
    expect(result.User.blocks.through).toEqual({
      sheet: "_Blocks",
      field: "userBId",
      reference: "userAId",
    });
    expect(result.User.blockedBy.through).toEqual({
      sheet: "_Blocks",
      field: "userAId",
      reference: "userBId",
    });
  });

  it("should keep model-name columns for a named non-self manyToMany", () => {
    const schema = `
model Post {
  id   Int   @id
  tags Tag[] @relation("PostTags")
}

model Tag {
  id    Int    @id
  posts Post[] @relation("PostTags")
}
`;
    const result = extractRelations(schema);

    expect(result.Post.tags.through).toEqual({
      sheet: "_PostTags",
      field: "postId",
      reference: "tagId",
    });
    expect(result.Tag.posts.through).toEqual({
      sheet: "_PostTags",
      field: "tagId",
      reference: "postId",
    });
  });

  it("should split two named relations between two models into distinct sheets", () => {
    const schema = `
model Post {
  id       Int   @id
  tags     Tag[] @relation("PostTags")
  featured Tag[] @relation("FeaturedTags")
}

model Tag {
  id         Int    @id
  posts      Post[] @relation("PostTags")
  featuredIn Post[] @relation("FeaturedTags")
}
`;
    const result = extractRelations(schema);

    expect(result.Post.tags.through).toEqual({
      sheet: "_PostTags",
      field: "postId",
      reference: "tagId",
    });
    expect(result.Post.featured.through).toEqual({
      sheet: "_FeaturedTags",
      field: "postId",
      reference: "tagId",
    });
    expect(result.Tag.posts.through).toEqual({
      sheet: "_PostTags",
      field: "tagId",
      reference: "postId",
    });
    expect(result.Tag.featuredIn.through).toEqual({
      sheet: "_FeaturedTags",
      field: "tagId",
      reference: "postId",
    });
  });

  it("should name the through sheet after a name argument relation", () => {
    const schema = `
model Post {
  id   Int   @id
  tags Tag[] @relation(name: "PostTags")
}

model Tag {
  id    Int    @id
  posts Post[] @relation(name: "PostTags")
}
`;
    const result = extractRelations(schema);

    expect(result.Post.tags.through).toEqual({
      sheet: "_PostTags",
      field: "postId",
      reference: "tagId",
    });
    expect(result.Tag.posts.through).toEqual({
      sheet: "_PostTags",
      field: "tagId",
      reference: "postId",
    });
  });

  it("should pair self-referencing sides declared with a name argument relation", () => {
    const schema = `
model User {
  id         Int    @id
  follows    User[] @relation(name: "Follows")
  followedBy User[] @relation(name: "Follows")
}
`;
    const result = extractRelations(schema);

    expect(result.User.follows.through).toEqual({
      sheet: "_Follows",
      field: "userBId",
      reference: "userAId",
    });
    expect(result.User.followedBy.through).toEqual({
      sheet: "_Follows",
      field: "userAId",
      reference: "userBId",
    });
  });

  it("should split two name argument relations on the same pair into distinct sheets", () => {
    const schema = `
model User {
  id         Int    @id
  follows    User[] @relation(name: "Follows")
  followedBy User[] @relation(name: "Follows")
  blocks     User[] @relation(name: "Blocks")
  blockedBy  User[] @relation(name: "Blocks")
}
`;
    const result = extractRelations(schema);

    expect(result.User.follows.through).toEqual({
      sheet: "_Follows",
      field: "userBId",
      reference: "userAId",
    });
    expect(result.User.followedBy.through).toEqual({
      sheet: "_Follows",
      field: "userAId",
      reference: "userBId",
    });
    expect(result.User.blocks.through).toEqual({
      sheet: "_Blocks",
      field: "userBId",
      reference: "userAId",
    });
    expect(result.User.blockedBy.through).toEqual({
      sheet: "_Blocks",
      field: "userAId",
      reference: "userBId",
    });
  });

  it("should split two name argument relations between two models into distinct sheets", () => {
    const schema = `
model Post {
  id       Int   @id
  tags     Tag[] @relation(name: "PostTags")
  featured Tag[] @relation(name: "FeaturedTags")
}

model Tag {
  id         Int    @id
  posts      Post[] @relation(name: "PostTags")
  featuredIn Post[] @relation(name: "FeaturedTags")
}
`;
    const result = extractRelations(schema);

    expect(result.Post.tags.through).toEqual({
      sheet: "_PostTags",
      field: "postId",
      reference: "tagId",
    });
    expect(result.Post.featured.through).toEqual({
      sheet: "_FeaturedTags",
      field: "postId",
      reference: "tagId",
    });
    expect(result.Tag.posts.through).toEqual({
      sheet: "_PostTags",
      field: "tagId",
      reference: "postId",
    });
    expect(result.Tag.featuredIn.through).toEqual({
      sheet: "_FeaturedTags",
      field: "tagId",
      reference: "postId",
    });
  });

  it("should read the relation name regardless of argument order", () => {
    const schema = `
model User {
  id            Int    @id
  writtenPosts  Post[] @relation(name: "WrittenPosts")
  favoritePosts Post[] @relation(name: "FavoritePosts")
}

model Post {
  id            Int   @id
  author        User  @relation(fields: [authorId], references: [id], name: "WrittenPosts")
  authorId      Int
  favoritedBy   User? @relation(name: "FavoritePosts", fields: [favoritedById], references: [id])
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
    expect(result.Post.favoritedBy).toEqual({
      type: "manyToOne",
      to: "User",
      field: "favoritedById",
      reference: "id",
    });
  });

  it("should keep shorthand and unnamed through sheets when mixed with name arguments", () => {
    const schema = `
model Post {
  id       Int     @id
  tags     Tag[]   @relation(name: "PostTags")
  featured Tag[]   @relation("FeaturedTags")
  labels   Label[]
}

model Tag {
  id         Int    @id
  posts      Post[] @relation(name: "PostTags")
  featuredIn Post[] @relation("FeaturedTags")
}

model Label {
  id    Int    @id
  posts Post[]
}
`;
    const result = extractRelations(schema);

    expect(result.Post.tags.through?.sheet).toBe("_PostTags");
    expect(result.Post.featured.through?.sheet).toBe("_FeaturedTags");
    expect(result.Post.labels.through).toEqual({
      sheet: "_LabelToPost",
      field: "postId",
      reference: "labelId",
    });
    expect(result.Label.posts.through).toEqual({
      sheet: "_LabelToPost",
      field: "labelId",
      reference: "postId",
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

  it("should assign A/B columns to a self-referencing implicit manyToMany", () => {
    const schema = `
model Tag {
  id        Int   @id
  related   Tag[] @relation("TagRelations")
  relatedBy Tag[] @relation("TagRelations")
}
`;
    const result = extractRelations(schema);

    expect(result.Tag.related).toEqual({
      type: "manyToMany",
      to: "Tag",
      field: "id",
      reference: "id",
      through: {
        sheet: "_TagRelations",
        field: "tagAId",
        reference: "tagBId",
      },
    });
    expect(result.Tag.relatedBy).toEqual({
      type: "manyToMany",
      to: "Tag",
      field: "id",
      reference: "id",
      through: {
        sheet: "_TagRelations",
        field: "tagBId",
        reference: "tagAId",
      },
    });
  });

  it("should keep self-referencing A/B sides stable across declaration order", () => {
    const schema = `
model Tag {
  id        Int   @id
  relatedBy Tag[] @relation("TagRelations")
  related   Tag[] @relation("TagRelations")
}
`;
    const result = extractRelations(schema);

    expect(result.Tag.related.through).toEqual({
      sheet: "_TagRelations",
      field: "tagAId",
      reference: "tagBId",
    });
    expect(result.Tag.relatedBy.through).toEqual({
      sheet: "_TagRelations",
      field: "tagBId",
      reference: "tagAId",
    });
  });

  it("should pair self-referencing manyToMany fields by relation name", () => {
    const schema = `
model Node {
  id       Int    @id
  parentId Int?
  parent   Node?  @relation("Tree", fields: [parentId], references: [id])
  children Node[] @relation("Tree")
  linked   Node[] @relation("Links")
  linkedBy Node[] @relation("Links")
}
`;
    const result = extractRelations(schema);

    expect(result.Node.linked.through).toEqual({
      sheet: "_Links",
      field: "nodeAId",
      reference: "nodeBId",
    });
    expect(result.Node.linkedBy.through).toEqual({
      sheet: "_Links",
      field: "nodeBId",
      reference: "nodeAId",
    });
    expect(result.Node.children).toEqual({
      type: "oneToMany",
      to: "Node",
      field: "id",
      reference: "parentId",
    });
  });

  it("should keep A/B sides stable regardless of unrelated field positions", () => {
    const schema = `
model Node {
  id       Int    @id
  linked   Node[] @relation("Links")
  linkedBy Node[] @relation("Links")
  parentId Int?
  parent   Node?  @relation("Tree", fields: [parentId], references: [id])
  children Node[] @relation("Tree")
}
`;
    const result = extractRelations(schema);

    expect(result.Node.linked.through).toEqual({
      sheet: "_Links",
      field: "nodeAId",
      reference: "nodeBId",
    });
    expect(result.Node.linkedBy.through).toEqual({
      sheet: "_Links",
      field: "nodeBId",
      reference: "nodeAId",
    });
  });

  it("should use A/B columns when only one self-referencing list field exists", () => {
    const schema = `
model Tag {
  id      Int   @id
  related Tag[]
}
`;
    const result = extractRelations(schema);

    expect(result.Tag.related.through).toEqual({
      sheet: "_TagToTag",
      field: "tagAId",
      reference: "tagBId",
    });
  });

  it("should not create a through sheet for a self-referencing oneToMany", () => {
    const schema = `
model Category {
  id       Int        @id
  parentId Int?
  parent   Category?  @relation(fields: [parentId], references: [id])
  children Category[]
}
`;
    const result = extractRelations(schema);

    expect(result.Category.children).toEqual({
      type: "oneToMany",
      to: "Category",
      field: "id",
      reference: "parentId",
    });
    const types = Object.values(result.Category).map((rel) => rel.type);
    expect(types).not.toContain("manyToMany");
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
