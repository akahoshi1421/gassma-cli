import { describe, it, expect } from "vitest";
import { buildCreateDataType } from "../../../../generate/typeGenerate/util/buildCreateDataType";
import type { RelationsConfig } from "../../../../generate/read/extractRelations";

describe("buildCreateDataType", () => {
  const postRelations: RelationsConfig = {
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

  const userRelations: RelationsConfig = {
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

  it("should return the bare Use type without relations", () => {
    expect(buildCreateDataType("", "User")).toBe("GassmaUserUse");
  });

  it("should build the FK XOR for ownsFk relations", () => {
    const result = buildCreateDataType("", "Post", postRelations);

    expect(result).toBe(
      'Omit<GassmaPostUse, "authorId"> & (Pick<GassmaPostUse, "authorId"> | { "author": { create?: GassmaUserUse; connect?: GassmaUserWhereUse; connectOrCreate?: { where: GassmaUserWhereUse; create: GassmaUserUse } } })',
    );
  });

  it("should append create-context nested fields for non-FK relations", () => {
    const result = buildCreateDataType("", "User", userRelations);

    expect(result).toContain("GassmaUserUse & {");
    expect(result).toContain(
      'createMany?: { data: Omit<GassmaPostUse, "authorId">[] }',
    );
  });

  it("should not include update-only ops", () => {
    const result = buildCreateDataType("", "User", userRelations);

    expect(result).not.toContain("update?:");
    expect(result).not.toContain("delete?:");
    expect(result).not.toContain("deleteMany?:");
    expect(result).not.toContain("disconnect?:");
    expect(result).not.toContain("set?:");
  });
});
