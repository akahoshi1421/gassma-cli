import { getOneGassmaCreate } from "../../../generate/typeGenerate/gassmaCreate/oneGassmaCreate";
import type { RelationsConfig } from "../../../generate/read/extractRelations";

describe("getOneGassmaCreate", () => {
  it("should generate CreateData without relations", () => {
    const result = getOneGassmaCreate("User");

    expect(result).toContain("declare type GassmaUserCreateData");
    expect(result).toContain("data: GassmaUserUse");
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

    const result = getOneGassmaCreate("User", relations);

    expect(result).toContain(
      'data: GassmaUserUse & {\n    "posts"?: Gassma.NestedWriteOperation;\n  }',
    );
  });

  it("should add multiple relation fields", () => {
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

    const result = getOneGassmaCreate("User", relations);

    expect(result).toContain('"posts"?: Gassma.NestedWriteOperation');
    expect(result).toContain('"profile"?: Gassma.NestedWriteOperation');
  });

  it("should include select property", () => {
    const result = getOneGassmaCreate("User");

    expect(result).toContain("select?: GassmaUserSelect;");
  });

  it("should include omit property", () => {
    const result = getOneGassmaCreate("User");

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

    const result = getOneGassmaCreate("User", relations);

    expect(result).toContain("data: GassmaUserUse;");
    expect(result).not.toContain("NestedWriteOperation");
  });
});
