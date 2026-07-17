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
      },
    },
  };

  it("should emit base operations for manyToOne", () => {
    const result = getNestedWriteFields("", "Post", manyToOneRelations);

    expect(result).toContain('"author"?:');
    expect(result).toContain("create?: GassmaUserUse");
    expect(result).toContain("connect?: GassmaUserWhereUse");
    expect(result).toContain(
      "connectOrCreate?: { where: GassmaUserWhereUse; create: GassmaUserUse }",
    );
  });

  it("should emit update/delete/disconnect for manyToOne (same as oneToOne)", () => {
    const result = getNestedWriteFields("", "Post", manyToOneRelations);

    expect(result).toContain("update?: Partial<GassmaUserUse>");
    expect(result).toContain("delete?: true");
    expect(result).toContain("disconnect?: true");
  });

  it("should omit the auto-set FK from oneToMany create children", () => {
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

    const result = getNestedWriteFields("", "User", relations);

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
        },
        tags: {
          type: "manyToMany",
          to: "Tag",
          field: "id",
          reference: "id",
          through: { sheet: "_PostToTag", field: "postId", reference: "tagId" },
        },
      },
    };

    const result = getNestedWriteFields("", "Post", relations);

    expect(result).toContain("create?: GassmaUserUse;");
    expect(result).toContain("create?: GassmaTagUse | GassmaTagUse[]");
    expect(result).not.toContain("Omit<");
  });
});
