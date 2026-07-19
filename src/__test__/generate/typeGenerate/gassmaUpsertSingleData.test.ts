import { describe, it, expect } from "vitest";
import { getOneGassmaUpsertSingleData } from "../../../generate/typeGenerate/gassmaUpsertData/oneGassmaUpsertSingleData";
import type { RelationsConfig } from "../../../generate/read/extractRelations";

describe("getOneGassmaUpsertSingleData", () => {
  const userContent: Record<string, unknown[]> = {
    id: ["number"],
    name: ["string"],
  };
  const postContent: Record<string, unknown[]> = {
    id: ["number"],
    title: ["string"],
    "authorId?": ["number"],
  };

  it("should generate UpsertSingleData type", () => {
    const result = getOneGassmaUpsertSingleData("", "User", userContent);

    expect(result).toContain("export type GassmaUserUpsertSingleData");
  });

  it("should include where property", () => {
    const result = getOneGassmaUpsertSingleData("", "User", userContent);

    expect(result).toContain("where: GassmaUserWhereUse;");
  });

  it("should include create property", () => {
    const result = getOneGassmaUpsertSingleData("", "User", userContent);

    expect(result).toContain("create: GassmaUserUse");
  });

  it("should include update with NumberOperation only on number columns", () => {
    const result = getOneGassmaUpsertSingleData("", "User", userContent);

    expect(result).toContain(
      'update: Partial<{ [K in keyof GassmaUserUse]: GassmaUserUse[K] | (K extends "id" ? Gassma.NumberOperation : never) }>',
    );
  });

  it("should not add NumberOperation when there is no number column", () => {
    const result = getOneGassmaUpsertSingleData("", "User", {
      name: ["string"],
    });

    expect(result).toContain("update: Partial<GassmaUserUse>");
    expect(result).not.toContain("NumberOperation");
  });

  it("should include select property", () => {
    const result = getOneGassmaUpsertSingleData("", "User", userContent);

    expect(result).toContain("select?: GassmaUserSelect;");
  });

  it("should include include property", () => {
    const result = getOneGassmaUpsertSingleData("", "User", userContent);

    expect(result).toContain("include?: GassmaUserInclude;");
  });

  it("should include omit property", () => {
    const result = getOneGassmaUpsertSingleData("", "User", userContent);

    expect(result).toContain("omit?: GassmaUserOmit");
  });

  it("should make select and omit mutually exclusive", () => {
    const result = getOneGassmaUpsertSingleData("", "User", userContent);

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

    const result = getOneGassmaUpsertSingleData(
      "",
      "User",
      userContent,
      relations,
    );

    expect(result).toContain('"posts"?:');
    expect(result).toContain(
      'create?: Omit<GassmaPostUse, "authorId"> | Omit<GassmaPostUse, "authorId">[]',
    );
    expect(result).toContain(
      "connect?: GassmaPostWhereUse | GassmaPostWhereUse[]",
    );
  });

  it("should add NumberOperation to nested update data for target number columns", () => {
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
    const dictYaml: Record<string, Record<string, unknown[]>> = {
      User: userContent,
      Post: postContent,
    };

    const result = getOneGassmaUpsertSingleData(
      "",
      "User",
      userContent,
      relations,
      undefined,
      dictYaml,
    );

    expect(result).toContain(
      'update?: { where: GassmaPostWhereUse; data: Partial<{ [K in keyof GassmaPostUse]: GassmaPostUse[K] | (K extends "id" | "authorId" ? Gassma.NumberOperation : never) }> }',
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

    const result = getOneGassmaUpsertSingleData(
      "",
      "Post",
      postContent,
      relations,
    );

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

    const result = getOneGassmaUpsertSingleData(
      "",
      "User",
      userContent,
      relations,
    );
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

    const result = getOneGassmaUpsertSingleData(
      "",
      "User",
      userContent,
      relations,
    );
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
