import { getOneGassmaWhereUse } from "../../../generate/typeGenerate/gassmaWhereUse/oneGassmaWhereUse";
import type { RelationsConfig } from "../../../generate/read/extractRelations";

describe("getOneGassmaWhereUse", () => {
  const sheetContent = {
    id: ["number"],
    name: ["string"],
  };

  it("should generate WhereUse without relations", () => {
    const result = getOneGassmaWhereUse(sheetContent, "", "User");

    expect(result).toContain("export type GassmaUserWhereUse");
    expect(result).toContain('"id"?:');
    expect(result).toContain('"name"?:');
    expect(result).toContain("AND?: GassmaUserWhereUse[]");
    expect(result).toContain("OR?: GassmaUserWhereUse[]");
    expect(result).toContain("NOT?: GassmaUserWhereUse[]");
  });

  it("should add oneToMany relation filter with some/every/none", () => {
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

    const result = getOneGassmaWhereUse(sheetContent, "", "User", relations);

    expect(result).toContain(
      '"posts"?: { some?: GassmaPostWhereUse; every?: GassmaPostWhereUse; none?: GassmaPostWhereUse }',
    );
  });

  it("should add manyToOne relation filter with is/isNot", () => {
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

    const result = getOneGassmaWhereUse(sheetContent, "", "Post", relations);

    expect(result).toContain(
      '"author"?: { is?: GassmaUserWhereUse; isNot?: GassmaUserWhereUse }',
    );
  });

  it("should add oneToOne relation filter with is/isNot", () => {
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

    const result = getOneGassmaWhereUse(sheetContent, "", "User", relations);

    expect(result).toContain(
      '"profile"?: { is?: GassmaProfileWhereUse; isNot?: GassmaProfileWhereUse }',
    );
  });

  it("should add manyToMany relation filter with some/every/none", () => {
    const relations: RelationsConfig = {
      Post: {
        tags: {
          type: "manyToMany",
          to: "Tag",
          field: "id",
          reference: "id",
        },
      },
    };

    const result = getOneGassmaWhereUse(sheetContent, "", "Post", relations);

    expect(result).toContain(
      '"tags"?: { some?: GassmaTagWhereUse; every?: GassmaTagWhereUse; none?: GassmaTagWhereUse }',
    );
  });

  it("should not add relation fields when no relations for model", () => {
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

    const result = getOneGassmaWhereUse(sheetContent, "", "User", relations);

    expect(result).not.toContain("RelationListFilter");
    expect(result).not.toContain("RelationSingleFilter");
  });
});
