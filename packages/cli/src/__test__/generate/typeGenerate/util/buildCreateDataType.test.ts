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
      },
    },
  };

  it("should return the bare Use type without relations", () => {
    expect(buildCreateDataType("", "User")).toBe(
      "Gassma.RawAllowed<GassmaUserUse>",
    );
  });

  it("should build the FK XOR for manyToOne relations", () => {
    const result = buildCreateDataType("", "Post", postRelations);

    expect(result).toBe(
      'Gassma.RawAllowed<Omit<GassmaPostUse, "authorId">> & (Gassma.RawAllowed<Pick<GassmaPostUse, "authorId">> | { "author": { create?: Gassma.RawAllowed<GassmaUserUse>; connect?: GassmaUserWhereUse; connectOrCreate?: { where: GassmaUserWhereUse; create: Gassma.RawAllowed<GassmaUserUse> } } })',
    );
  });

  it("should build the FK XOR for the FK side of a 1:1 relation (manyToOne)", () => {
    const relations: RelationsConfig = {
      Profile: {
        user: {
          type: "manyToOne",
          to: "User",
          field: "userId",
          reference: "id",
        },
      },
    };

    const result = buildCreateDataType("", "Profile", relations);

    expect(result).toBe(
      'Gassma.RawAllowed<Omit<GassmaProfileUse, "userId">> & (Gassma.RawAllowed<Pick<GassmaProfileUse, "userId">> | { "user": { create?: Gassma.RawAllowed<GassmaUserUse>; connect?: GassmaUserWhereUse; connectOrCreate?: { where: GassmaUserWhereUse; create: Gassma.RawAllowed<GassmaUserUse> } } })',
    );
  });

  it("should not build the FK XOR for inverse oneToOne relations", () => {
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

    const result = buildCreateDataType("", "User", relations);

    expect(result).toContain("Gassma.RawAllowed<GassmaUserUse> & {");
    expect(result).not.toContain("Pick<");
    expect(result).toContain(
      'create?: Gassma.RawAllowed<Omit<GassmaProfileUse, "userId">>',
    );
  });

  it("should append create-context nested fields for non-FK relations", () => {
    const result = buildCreateDataType("", "User", userRelations);

    expect(result).toContain("Gassma.RawAllowed<GassmaUserUse> & {");
    expect(result).toContain(
      'createMany?: { data: Gassma.RawAllowed<Omit<GassmaPostUse, "authorId">>[] }',
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
