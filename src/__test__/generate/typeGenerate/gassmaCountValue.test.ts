import { getOneGassmaCountValue } from "../../../generate/typeGenerate/gassmaCountValue/oneGassmaCountValue";
import type { RelationsConfig } from "../../../generate/read/extractRelations";

describe("getOneGassmaCountValue", () => {
  it("should generate CountValue type with relation names in select", () => {
    const relations: RelationsConfig = {
      User: {
        posts: {
          type: "oneToMany",
          to: "Post",
          field: "id",
          reference: "authorId",
        },
        comments: {
          type: "oneToMany",
          to: "Comment",
          field: "id",
          reference: "userId",
        },
      },
    };

    const result = getOneGassmaCountValue("", "User", relations);

    expect(result).toContain("declare type GassmaUserCountValue");
    expect(result).toContain('"posts"?: true | { where?: GassmaPostWhereUse }');
    expect(result).toContain(
      '"comments"?: true | { where?: GassmaCommentWhereUse }',
    );
  });

  it("should return true-only type when no relations", () => {
    const relations: RelationsConfig = {};

    const result = getOneGassmaCountValue("", "User", relations);

    expect(result).toContain("declare type GassmaUserCountValue = true;");
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

    const result = getOneGassmaCountValue("Test", "User", relations);

    expect(result).toContain("declare type GassmaTestUserCountValue");
  });
});
