import { getOneGassmaInclude } from "../../../generate/typeGenerate/gassmaInclude/oneGassmaInclude";
import type { RelationsConfig } from "../../../generate/read/extractRelations";

describe("getOneGassmaInclude", () => {
  it("should generate Include type with relation names as keys", () => {
    const relations: RelationsConfig = {
      User: {
        posts: {
          type: "oneToMany",
          to: "Post",
          field: "id",
          reference: "authorId",
        },
        profile: {
          type: "oneToOne",
          to: "Profile",
          field: "id",
          reference: "userId",
        },
      },
    };

    const result = getOneGassmaInclude("", "User", relations);

    expect(result).toContain("export type GassmaUserInclude");
    expect(result).toContain('"posts"?:');
    expect(result).toContain('"profile"?:');
  });

  it("should use true or include options as value type", () => {
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

    const result = getOneGassmaInclude("", "User", relations);

    expect(result).toContain(
      '"posts"?: true | { select?: GassmaPostSelect; omit?: GassmaPostOmit; where?: GassmaPostWhereUse; orderBy?: GassmaPostOrderBy; take?: number; skip?: number; include?: GassmaPostInclude; _count?: GassmaPostCountValue };',
    );
  });

  it("should include _count at top level", () => {
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

    const result = getOneGassmaInclude("", "User", relations);

    expect(result).toContain('"_count"?: GassmaUserCountValue');
  });

  it("should return empty type when no relations", () => {
    const relations: RelationsConfig = {};

    const result = getOneGassmaInclude("", "User", relations);

    expect(result).toContain("export type GassmaUserInclude = {};");
  });

  it("should work with schemaName prefix", () => {
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

    const result = getOneGassmaInclude("Test", "User", relations);

    expect(result).toContain("export type GassmaTestUserInclude");
    expect(result).toContain("GassmaTestPostSelect");
    expect(result).toContain("GassmaTestPostWhereUse");
  });
});
