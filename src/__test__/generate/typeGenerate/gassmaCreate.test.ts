import { getOneGassmaCreate } from "../../../generate/typeGenerate/gassmaCreate/oneGassmaCreate";
import type { RelationsConfig } from "../../../generate/read/extractRelations";

describe("getOneGassmaCreate", () => {
  it("should generate CreateData without relations", () => {
    const result = getOneGassmaCreate("", "User");

    expect(result).toContain("declare type GassmaUserCreateData");
    expect(result).toContain("data: GassmaUserUse");
  });

  it("should add nested write operations with target model types for oneToMany", () => {
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

    const result = getOneGassmaCreate("", "User", relations);

    expect(result).toContain('"posts"?:');
    expect(result).toContain("create?: GassmaPostUse | GassmaPostUse[]");
    expect(result).toContain(
      "connect?: GassmaPostWhereUse | GassmaPostWhereUse[]",
    );
    expect(result).toContain(
      "connectOrCreate?: { where: GassmaPostWhereUse; create: GassmaPostUse }",
    );
  });

  it("should add nested write operations with target model types for oneToOne", () => {
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

    const result = getOneGassmaCreate("", "User", relations);

    expect(result).toContain('"profile"?:');
    expect(result).toContain("create?: GassmaProfileUse");
    expect(result).toContain("connect?: GassmaProfileWhereUse");
    expect(result).toContain(
      "connectOrCreate?: { where: GassmaProfileWhereUse; create: GassmaProfileUse }",
    );
  });

  it("should include select property", () => {
    const result = getOneGassmaCreate("", "User");

    expect(result).toContain("select?: GassmaUserSelect;");
  });

  it("should include omit property", () => {
    const result = getOneGassmaCreate("", "User");

    expect(result).toContain("omit?: GassmaUserOmit;");
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

    const result = getOneGassmaCreate("", "User", relations);

    expect(result).toContain("data: GassmaUserUse;");
    expect(result).not.toContain("NestedWriteOperation");
  });
});
