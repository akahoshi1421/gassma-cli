import { getOneGassmaFindSelect } from "../../../generate/typeGenerate/gassmaSelect/oneGassmaFindSelect";
import type { RelationsConfig } from "../../../generate/read/extractRelations";

describe("getOneGassmaFindSelect", () => {
  const sheetContent = {
    id: ["number"],
    name: ["string"],
    "email?": ["string"],
  };

  it("should generate FindSelect with scalar fields only when no relations", () => {
    const result = getOneGassmaFindSelect(sheetContent, "Test", "User");

    expect(result).toContain("export type GassmaTestUserFindSelect = {");
    expect(result).toContain('"id"?: true;');
    expect(result).toContain('"name"?: true;');
    expect(result).toContain('"email"?: true;');
    expect(result).not.toContain("_count");
  });

  it("should include relation fields with options when relations exist", () => {
    const relations: RelationsConfig = {
      User: {
        posts: {
          type: "oneToMany",
          to: "Post",
          field: "id",
          reference: "userId",
        },
      },
    };
    const result = getOneGassmaFindSelect(
      sheetContent,
      "Test",
      "User",
      relations,
    );

    expect(result).toContain('"id"?: true;');
    expect(result).toContain('"posts"?: true | {');
    expect(result).toContain("select?: GassmaTestPostSelect");
    expect(result).toContain("where?: GassmaTestPostWhereUse");
    expect(result).toContain("orderBy?: GassmaTestPostOrderBy");
    expect(result).toContain("include?: GassmaTestPostInclude");
  });

  it("should include _count when relations exist", () => {
    const relations: RelationsConfig = {
      User: {
        posts: {
          type: "oneToMany",
          to: "Post",
          field: "id",
          reference: "userId",
        },
      },
    };
    const result = getOneGassmaFindSelect(
      sheetContent,
      "Test",
      "User",
      relations,
    );

    expect(result).toContain('"_count"?: GassmaTestUserCountValue;');
  });

  it("should handle multiple relation fields", () => {
    const relations: RelationsConfig = {
      User: {
        posts: {
          type: "oneToMany",
          to: "Post",
          field: "id",
          reference: "userId",
        },
        profile: {
          type: "oneToOne",
          to: "Profile",
          field: "id",
          reference: "userId",
        },
      },
    };
    const result = getOneGassmaFindSelect(
      sheetContent,
      "Test",
      "User",
      relations,
    );

    expect(result).toContain('"posts"?: true | {');
    expect(result).toContain('"profile"?: true | {');
  });

  it("should not include relation fields for sheets without relations", () => {
    const relations: RelationsConfig = {
      Post: {
        author: {
          type: "manyToOne",
          to: "User",
          field: "userId",
          reference: "id",
        },
      },
    };
    const result = getOneGassmaFindSelect(
      sheetContent,
      "Test",
      "User",
      relations,
    );

    expect(result).not.toContain("author");
    expect(result).not.toContain("_count");
  });
});
