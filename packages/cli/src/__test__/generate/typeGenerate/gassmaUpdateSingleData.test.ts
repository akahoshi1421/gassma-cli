import { describe, it, expect } from "vitest";
import { getOneGassmaUpdateSingleData } from "../../../generate/typeGenerate/gassmaUpdateData/oneGassmaUpdateSingleData";
import type { RelationsConfig } from "../../../generate/read/extractRelations";

describe("getOneGassmaUpdateSingleData", () => {
  const userContent: Record<string, unknown[]> = {
    id: ["number"],
    name: ["string"],
  };

  it("should generate UpdateSingleData type", () => {
    const result = getOneGassmaUpdateSingleData("", "User", userContent);

    expect(result).toContain("export type GassmaUserUpdateSingleData");
  });

  it("should include where property", () => {
    const result = getOneGassmaUpdateSingleData("", "User", userContent);

    expect(result).toContain("where: GassmaUserWhereUse;");
  });

  it("should include data with NumberOperation only on number columns", () => {
    const result = getOneGassmaUpdateSingleData("", "User", userContent);

    expect(result).toContain(
      'data: Partial<{ [K in keyof GassmaUserUse]: GassmaUserUse[K] | (K extends "id" ? Gassma.NumberOperation : never) }>',
    );
  });

  it("should not add NumberOperation when there is no number column", () => {
    const result = getOneGassmaUpdateSingleData("", "User", {
      name: ["string"],
    });

    expect(result).toContain("data: Partial<GassmaUserUse>");
    expect(result).not.toContain("NumberOperation");
  });

  it("should include select property", () => {
    const result = getOneGassmaUpdateSingleData("", "User", userContent);

    expect(result).toContain("select?: GassmaUserSelect;");
  });

  it("should include omit property", () => {
    const result = getOneGassmaUpdateSingleData("", "User", userContent);

    expect(result).toContain("omit?: GassmaUserOmit");
  });

  it("should make select and omit mutually exclusive", () => {
    const result = getOneGassmaUpdateSingleData("", "User", userContent);

    expect(result).toContain("select?: GassmaUserSelect; omit?: never");
    expect(result).toContain("select?: never; omit?: GassmaUserOmit");
  });

  it("should include include property", () => {
    const result = getOneGassmaUpdateSingleData("", "User", userContent);

    expect(result).toContain("include?: GassmaUserInclude");
  });

  it("should add nested write operations for relations", () => {
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

    const result = getOneGassmaUpdateSingleData(
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
      Post: { id: ["number"], title: ["string"], "authorId?": ["number"] },
    };

    const result = getOneGassmaUpdateSingleData(
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

  it("should omit the auto-set FK from oneToOne create children only", () => {
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
    const dictYaml: Record<string, Record<string, unknown[]>> = {
      User: userContent,
      Profile: { id: ["number"], userId: ["number"], bio: ["string"] },
    };

    const result = getOneGassmaUpdateSingleData(
      "",
      "User",
      userContent,
      relations,
      undefined,
      dictYaml,
    );

    expect(result).toContain('"profile"?:');
    expect(result).toContain('create?: Omit<GassmaProfileUse, "userId">;');
    expect(result).toContain(
      'connectOrCreate?: { where: GassmaProfileWhereUse; create: Omit<GassmaProfileUse, "userId"> }',
    );
    expect(result).toContain(
      'update?: Partial<{ [K in keyof GassmaProfileUse]: GassmaProfileUse[K] | (K extends "id" | "userId" ? Gassma.NumberOperation : never) }>',
    );
    expect(result).toContain("delete?: true");
    expect(result).toContain("disconnect?: true");
  });
});
