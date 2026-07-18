import { describe, it, expect } from "vitest";
import { getOneGassmaUpsertSingleData } from "../../../generate/typeGenerate/gassmaUpsertData/oneGassmaUpsertSingleData";
import type { RelationsConfig } from "../../../generate/read/extractRelations";

describe("getOneGassmaUpsertSingleData", () => {
  it("should generate UpsertSingleData type", () => {
    const result = getOneGassmaUpsertSingleData("", "User");

    expect(result).toContain("export type GassmaUserUpsertSingleData");
  });

  it("should include where property", () => {
    const result = getOneGassmaUpsertSingleData("", "User");

    expect(result).toContain("where: GassmaUserWhereUse;");
  });

  it("should include create property", () => {
    const result = getOneGassmaUpsertSingleData("", "User");

    expect(result).toContain("create: GassmaUserUse");
  });

  it("should include update with Partial NumberOperation", () => {
    const result = getOneGassmaUpsertSingleData("", "User");

    expect(result).toContain("Partial<");
    expect(result).toContain(
      "[K in keyof GassmaUserUse]: GassmaUserUse[K] | Gassma.NumberOperation",
    );
  });

  it("should include select property", () => {
    const result = getOneGassmaUpsertSingleData("", "User");

    expect(result).toContain("select?: GassmaUserSelect;");
  });

  it("should include include property", () => {
    const result = getOneGassmaUpsertSingleData("", "User");

    expect(result).toContain("include?: GassmaUserInclude;");
  });

  it("should include omit property", () => {
    const result = getOneGassmaUpsertSingleData("", "User");

    expect(result).toContain("omit?: GassmaUserOmit");
  });

  it("should make select and omit mutually exclusive", () => {
    const result = getOneGassmaUpsertSingleData("", "User");

    expect(result).toContain("select?: GassmaUserSelect; omit?: never");
    expect(result).toContain("select?: never; omit?: GassmaUserOmit");
  });

  it("should add nested write operations for relations in create and update", () => {
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

    const result = getOneGassmaUpsertSingleData("", "User", relations);

    expect(result).toContain('"posts"?:');
    expect(result).toContain(
      'create?: Omit<GassmaPostUse, "authorId"> | Omit<GassmaPostUse, "authorId">[]',
    );
    expect(result).toContain(
      "connect?: GassmaPostWhereUse | GassmaPostWhereUse[]",
    );
  });

  it("should build create with the FK XOR (same shape as CreateData)", () => {
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

    const result = getOneGassmaUpsertSingleData("", "Post", relations);

    expect(result).toContain(
      'create: Omit<GassmaPostUse, "authorId"> & (Pick<GassmaPostUse, "authorId"> | { "author": { create?: GassmaUserUse; connect?: GassmaUserWhereUse; connectOrCreate?: { where: GassmaUserWhereUse; create: GassmaUserUse } } });',
    );
  });

  it("should emit only create-context ops in create for oneToMany", () => {
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

    const result = getOneGassmaUpsertSingleData("", "User", relations);
    const createPart = result.slice(
      result.indexOf("create:"),
      result.indexOf("update:"),
    );

    expect(createPart).toContain(
      'createMany?: { data: Omit<GassmaPostUse, "authorId">[] }',
    );
    expect(createPart).not.toContain("update?:");
    expect(createPart).not.toContain("delete?:");
    expect(createPart).not.toContain("deleteMany?:");
    expect(createPart).not.toContain("disconnect?:");
    expect(createPart).not.toContain("set?:");
  });

  it("should keep update-context ops (including createMany) in update for oneToMany", () => {
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

    const result = getOneGassmaUpsertSingleData("", "User", relations);
    const updatePart = result.slice(result.indexOf("update:"));

    expect(updatePart).toContain(
      'createMany?: { data: Omit<GassmaPostUse, "authorId">[] }',
    );
    expect(updatePart).toContain(
      "deleteMany?: GassmaPostWhereUse | GassmaPostWhereUse[]",
    );
    expect(updatePart).toContain("set?: GassmaPostWhereUse[]");
  });
});
