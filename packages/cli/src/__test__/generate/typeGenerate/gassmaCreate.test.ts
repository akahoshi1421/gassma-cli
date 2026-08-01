import { describe, it, expect } from "vitest";
import { getOneGassmaCreate } from "../../../generate/typeGenerate/gassmaCreate/oneGassmaCreate";
import type { RelationsConfig } from "../../../generate/read/extractRelations";

describe("getOneGassmaCreate", () => {
  it("should generate CreateData without relations", () => {
    const result = getOneGassmaCreate("", "User");

    expect(result).toContain("export type GassmaUserCreateData");
    expect(result).toContain("data: Gassma.RawAllowed<GassmaUserUse>");
  });

  it("should add nested write operations with target model types for oneToMany", () => {
    const relations: RelationsConfig = {
      User: {
        posts: {
          type: "oneToMany",
          to: "Post",
          field: "id",
          reference: "authorId",
        },
      },
    };

    const result = getOneGassmaCreate("", "User", relations);

    expect(result).toContain('"posts"?:');
    expect(result).toContain(
      'create?: Gassma.RawAllowed<Omit<GassmaPostUse, "authorId">> | Gassma.RawAllowed<Omit<GassmaPostUse, "authorId">>[]',
    );
    expect(result).toContain(
      'createMany?: { data: Gassma.RawAllowed<Omit<GassmaPostUse, "authorId">>[] }',
    );
    expect(result).toContain(
      "connect?: GassmaPostWhereUse | GassmaPostWhereUse[]",
    );
    expect(result).toContain(
      'connectOrCreate?: { where: GassmaPostWhereUse; create: Gassma.RawAllowed<Omit<GassmaPostUse, "authorId">> }',
    );
  });

  it("should add nested write operations with target model types for oneToOne", () => {
    const relations: RelationsConfig = {
      User: {
        profile: {
          type: "oneToOne",
          to: "Profile",
          field: "id",
          reference: "userId",
        },
      },
    };

    const result = getOneGassmaCreate("", "User", relations);

    expect(result).toContain('"profile"?:');
    expect(result).toContain(
      'create?: Gassma.RawAllowed<Omit<GassmaProfileUse, "userId">>',
    );
    expect(result).toContain("connect?: GassmaProfileWhereUse");
    expect(result).toContain(
      'connectOrCreate?: { where: GassmaProfileWhereUse; create: Gassma.RawAllowed<Omit<GassmaProfileUse, "userId">> }',
    );
  });

  it("should not emit update-only ops in create data", () => {
    const relations: RelationsConfig = {
      User: {
        posts: {
          type: "oneToMany",
          to: "Post",
          field: "id",
          reference: "authorId",
        },
      },
    };

    const result = getOneGassmaCreate("", "User", relations);

    expect(result).not.toContain("update?:");
    expect(result).not.toContain("delete?:");
    expect(result).not.toContain("deleteMany?:");
    expect(result).not.toContain("disconnect?:");
    expect(result).not.toContain("set?:");
  });

  it("should build the FK XOR for manyToOne relations", () => {
    const relations: RelationsConfig = {
      Post: {
        author: {
          type: "manyToOne",
          to: "User",
          field: "authorId",
          reference: "id",
        },
      },
    };

    const result = getOneGassmaCreate("", "Post", relations);

    expect(result).toContain(
      'data: Gassma.RawAllowed<Omit<GassmaPostUse, "authorId">> & (Gassma.RawAllowed<Pick<GassmaPostUse, "authorId">> | { "author": { create?: Gassma.RawAllowed<GassmaUserUse>; connect?: GassmaUserWhereUse; connectOrCreate?: { where: GassmaUserWhereUse; create: Gassma.RawAllowed<GassmaUserUse> } } });',
    );
  });

  it("should combine the FK XOR with non-FK nested fields", () => {
    const relations: RelationsConfig = {
      Post: {
        author: {
          type: "manyToOne",
          to: "User",
          field: "authorId",
          reference: "id",
        },
        tags: {
          type: "manyToMany",
          to: "Tag",
          field: "id",
          reference: "id",
          through: {
            sheet: "_PostToTag",
            field: "postId",
            reference: "tagId",
          },
        },
      },
    };

    const result = getOneGassmaCreate("", "Post", relations);

    expect(result).toContain(
      'data: Gassma.RawAllowed<Omit<GassmaPostUse, "authorId">> & (Gassma.RawAllowed<Pick<GassmaPostUse, "authorId">> | { "author": {',
    );
    expect(result).toContain(
      '"tags"?: { create?: Gassma.RawAllowed<GassmaTagUse> | Gassma.RawAllowed<GassmaTagUse>[]',
    );
    expect(result).not.toContain('"author"?:');
  });

  it("should omit all FK fields when multiple relations own FKs", () => {
    const relations: RelationsConfig = {
      PostTag: {
        post: {
          type: "manyToOne",
          to: "Post",
          field: "postId",
          reference: "id",
        },
        tag: {
          type: "manyToOne",
          to: "Tag",
          field: "tagId",
          reference: "id",
        },
      },
    };

    const result = getOneGassmaCreate("", "PostTag", relations);

    expect(result).toContain(
      'Gassma.RawAllowed<Omit<GassmaPostTagUse, "postId" | "tagId">>',
    );
    expect(result).toContain(
      '(Gassma.RawAllowed<Pick<GassmaPostTagUse, "postId">> | { "post": {',
    );
    expect(result).toContain(
      '(Gassma.RawAllowed<Pick<GassmaPostTagUse, "tagId">> | { "tag": {',
    );
  });

  it("should include select property", () => {
    const result = getOneGassmaCreate("", "User");

    expect(result).toContain("select?: GassmaUserSelect;");
  });

  it("should include omit property", () => {
    const result = getOneGassmaCreate("", "User");

    expect(result).toContain("omit?: GassmaUserOmit");
  });

  it("should make select and omit mutually exclusive", () => {
    const result = getOneGassmaCreate("", "User");

    expect(result).toContain("select?: GassmaUserSelect; omit?: never");
    expect(result).toContain("select?: never; omit?: GassmaUserOmit");
  });

  it("should include include property", () => {
    const result = getOneGassmaCreate("", "User");

    expect(result).toContain("include?: GassmaUserInclude");
  });

  it("should not add relation fields when no relations for model", () => {
    const relations: RelationsConfig = {
      Post: {
        author: {
          type: "manyToOne",
          to: "User",
          field: "authorId",
          reference: "id",
        },
      },
    };

    const result = getOneGassmaCreate("", "User", relations);

    expect(result).toContain("data: Gassma.RawAllowed<GassmaUserUse>;");
    expect(result).not.toContain("NestedWriteOperation");
  });
});
