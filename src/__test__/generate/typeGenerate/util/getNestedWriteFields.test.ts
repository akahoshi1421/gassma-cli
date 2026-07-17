import { describe, it, expect } from "vitest";
import { getNestedWriteFields } from "../../../../generate/typeGenerate/util/getNestedWriteFields";
import type { RelationsConfig } from "../../../../generate/read/extractRelations";

describe("getNestedWriteFields", () => {
  const manyToOneRelations: RelationsConfig = {
    Post: {
      author: {
        type: "manyToOne",
        to: "User",
        field: "authorId",
        reference: "id",
        ownsFk: true,
      },
    },
  };

  const oneToManyRelations: RelationsConfig = {
    User: {
      posts: {
        type: "oneToMany",
        to: "Post",
        field: "id",
        reference: "authorId",
        ownsFk: false,
      },
    },
  };

  describe("update context", () => {
    it("should emit base operations for manyToOne", () => {
      const result = getNestedWriteFields(
        "",
        "Post",
        manyToOneRelations,
        "update",
      );

      expect(result).toContain('"author"?:');
      expect(result).toContain("create?: GassmaUserUse");
      expect(result).toContain("connect?: GassmaUserWhereUse");
      expect(result).toContain(
        "connectOrCreate?: { where: GassmaUserWhereUse; create: GassmaUserUse }",
      );
    });

    it("should emit update/delete/disconnect for manyToOne (same as oneToOne)", () => {
      const result = getNestedWriteFields(
        "",
        "Post",
        manyToOneRelations,
        "update",
      );

      expect(result).toContain("update?: Partial<GassmaUserUse>");
      expect(result).toContain("delete?: true");
      expect(result).toContain("disconnect?: true");
    });

    it("should omit the auto-set FK from oneToMany create children", () => {
      const result = getNestedWriteFields(
        "",
        "User",
        oneToManyRelations,
        "update",
      );

      expect(result).toContain(
        'create?: Omit<GassmaPostUse, "authorId"> | Omit<GassmaPostUse, "authorId">[]',
      );
      expect(result).toContain(
        'connectOrCreate?: { where: GassmaPostWhereUse; create: Omit<GassmaPostUse, "authorId"> }',
      );
    });

    it("should NOT omit FK from manyToOne/manyToMany create children", () => {
      const relations: RelationsConfig = {
        Post: {
          author: {
            type: "manyToOne",
            to: "User",
            field: "authorId",
            reference: "id",
            ownsFk: true,
          },
          tags: {
            type: "manyToMany",
            to: "Tag",
            field: "id",
            reference: "id",
            ownsFk: false,
            through: {
              sheet: "_PostToTag",
              field: "postId",
              reference: "tagId",
            },
          },
        },
      };

      const result = getNestedWriteFields("", "Post", relations, "update");

      expect(result).toContain("create?: GassmaUserUse;");
      expect(result).toContain("create?: GassmaTagUse | GassmaTagUse[]");
      expect(result).not.toContain("Omit<");
    });

    it("should emit createMany for oneToMany (core update path runs processAfterCreate)", () => {
      const result = getNestedWriteFields(
        "",
        "User",
        oneToManyRelations,
        "update",
      );

      expect(result).toContain(
        'createMany?: { data: Omit<GassmaPostUse, "authorId">[] }',
      );
    });

    it("should not emit createMany for to-one relations", () => {
      const result = getNestedWriteFields(
        "",
        "Post",
        manyToOneRelations,
        "update",
      );

      expect(result).not.toContain("createMany?:");
    });

    it("should only accept where filters for oneToMany delete/disconnect", () => {
      const result = getNestedWriteFields(
        "",
        "User",
        oneToManyRelations,
        "update",
      );

      expect(result).toContain(
        "delete?: GassmaPostWhereUse | GassmaPostWhereUse[]",
      );
      expect(result).toContain(
        "disconnect?: GassmaPostWhereUse | GassmaPostWhereUse[]",
      );
      expect(result).not.toContain("boolean");
    });

    it("should emit only ops the core processes for manyToMany", () => {
      const relations: RelationsConfig = {
        Post: {
          tags: {
            type: "manyToMany",
            to: "Tag",
            field: "id",
            reference: "id",
            ownsFk: false,
            through: {
              sheet: "_PostToTag",
              field: "postId",
              reference: "tagId",
            },
          },
        },
      };

      const result = getNestedWriteFields("", "Post", relations, "update");

      expect(result).toContain(
        "disconnect?: GassmaTagWhereUse | GassmaTagWhereUse[]",
      );
      expect(result).toContain("set?: GassmaTagWhereUse[]");
      expect(result).not.toContain("boolean");
      expect(result).not.toContain("createMany?:");
      expect(result).not.toContain("update?:");
      expect(result).not.toContain("delete?:");
      expect(result).not.toContain("deleteMany?:");
    });
  });

  describe("create context", () => {
    it("should not emit ownsFk relations (handled by the FK XOR)", () => {
      const result = getNestedWriteFields(
        "",
        "Post",
        manyToOneRelations,
        "create",
      );

      expect(result).toBe("");
    });

    it("should emit oneToMany ops matching the runtime NESTED_WRITE_KEYS", () => {
      const result = getNestedWriteFields(
        "",
        "User",
        oneToManyRelations,
        "create",
      );

      expect(result).toContain(
        'create?: Omit<GassmaPostUse, "authorId"> | Omit<GassmaPostUse, "authorId">[]',
      );
      expect(result).toContain(
        'createMany?: { data: Omit<GassmaPostUse, "authorId">[] }',
      );
      expect(result).toContain(
        "connect?: GassmaPostWhereUse | GassmaPostWhereUse[]",
      );
      expect(result).toContain(
        'connectOrCreate?: { where: GassmaPostWhereUse; create: Omit<GassmaPostUse, "authorId"> }',
      );
      expect(result).not.toContain("update?:");
      expect(result).not.toContain("delete?:");
      expect(result).not.toContain("deleteMany?:");
      expect(result).not.toContain("disconnect?:");
      expect(result).not.toContain("set?:");
    });

    it("should emit only create/connect/connectOrCreate for manyToMany", () => {
      const relations: RelationsConfig = {
        Post: {
          tags: {
            type: "manyToMany",
            to: "Tag",
            field: "id",
            reference: "id",
            ownsFk: false,
            through: {
              sheet: "_PostToTag",
              field: "postId",
              reference: "tagId",
            },
          },
        },
      };

      const result = getNestedWriteFields("", "Post", relations, "create");

      expect(result).toContain("create?: GassmaTagUse | GassmaTagUse[]");
      expect(result).toContain(
        "connect?: GassmaTagWhereUse | GassmaTagWhereUse[]",
      );
      expect(result).toContain(
        "connectOrCreate?: { where: GassmaTagWhereUse; create: GassmaTagUse }",
      );
      expect(result).not.toContain("createMany?:");
      expect(result).not.toContain("disconnect?:");
      expect(result).not.toContain("set?:");
    });

    it("should emit only create/connect/connectOrCreate for inverse oneToOne", () => {
      const relations: RelationsConfig = {
        User: {
          profile: {
            type: "oneToOne",
            to: "Profile",
            field: "id",
            reference: "userId",
            ownsFk: false,
          },
        },
      };

      const result = getNestedWriteFields("", "User", relations, "create");

      expect(result).toContain("create?: GassmaProfileUse");
      expect(result).toContain("connect?: GassmaProfileWhereUse");
      expect(result).toContain(
        "connectOrCreate?: { where: GassmaProfileWhereUse; create: GassmaProfileUse }",
      );
      expect(result).not.toContain("createMany?:");
      expect(result).not.toContain("update?:");
      expect(result).not.toContain("delete?:");
      expect(result).not.toContain("disconnect?:");
    });
  });
});
