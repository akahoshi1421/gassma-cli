import { describe, it, expect } from "vitest";
import { getOneGassmaUpdateSingleData } from "../../../generate/typeGenerate/gassmaUpdateData/oneGassmaUpdateSingleData";
import type { RelationsConfig } from "../../../generate/read/extractRelations";

describe("getOneGassmaUpdateSingleData", () => {
  it("should generate UpdateSingleData type", () => {
    const result = getOneGassmaUpdateSingleData("", "User");

    expect(result).toContain("export type GassmaUserUpdateSingleData");
  });

  it("should include where property", () => {
    const result = getOneGassmaUpdateSingleData("", "User");

    expect(result).toContain("where: GassmaUserWhereUse;");
  });

  it("should include data with Partial NumberOperation", () => {
    const result = getOneGassmaUpdateSingleData("", "User");

    expect(result).toContain("Partial<");
    expect(result).toContain(
      "[K in keyof GassmaUserUse]: GassmaUserUse[K] | Gassma.NumberOperation",
    );
  });

  it("should include select property", () => {
    const result = getOneGassmaUpdateSingleData("", "User");

    expect(result).toContain("select?: GassmaUserSelect;");
  });

  it("should include omit property", () => {
    const result = getOneGassmaUpdateSingleData("", "User");

    expect(result).toContain("omit?: GassmaUserOmit");
  });

  it("should make select and omit mutually exclusive", () => {
    const result = getOneGassmaUpdateSingleData("", "User");

    expect(result).toContain("select?: GassmaUserSelect; omit?: never");
    expect(result).toContain("select?: never; omit?: GassmaUserOmit");
  });

  it("should include include property", () => {
    const result = getOneGassmaUpdateSingleData("", "User");

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

    const result = getOneGassmaUpdateSingleData("", "User", relations);

    expect(result).toContain('"posts"?:');
    expect(result).toContain(
      'create?: Omit<GassmaPostUse, "authorId"> | Omit<GassmaPostUse, "authorId">[]',
    );
    expect(result).toContain(
      "connect?: GassmaPostWhereUse | GassmaPostWhereUse[]",
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

    const result = getOneGassmaUpdateSingleData("", "User", relations);

    expect(result).toContain('"profile"?:');
    expect(result).toContain('create?: Omit<GassmaProfileUse, "userId">;');
    expect(result).toContain(
      'connectOrCreate?: { where: GassmaProfileWhereUse; create: Omit<GassmaProfileUse, "userId"> }',
    );
    expect(result).toContain("update?: Partial<GassmaProfileUse>");
    expect(result).toContain("delete?: true");
    expect(result).toContain("disconnect?: true");
  });
});
