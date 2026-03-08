import { getOneGassmaUpdateData } from "../../../generate/typeGenerate/gassmaUpdateData/oneGassmaUpdateData";
import type { RelationsConfig } from "../../../generate/read/extractRelations";

describe("getOneGassmaUpdateData", () => {
  it("should generate UpdateData without relations", () => {
    const result = getOneGassmaUpdateData("User");

    expect(result).toContain("declare type GassmaUserUpdateData");
    expect(result).toContain("data: GassmaUserUse;");
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

    const result = getOneGassmaUpdateData("User", relations);

    expect(result).toContain('"posts"?: Gassma.NestedWriteOperation');
  });
});
