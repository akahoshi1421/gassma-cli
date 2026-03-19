import { getOneGassmaUpdateData } from "../../../generate/typeGenerate/gassmaUpdateData/oneGassmaUpdateData";
import type { RelationsConfig } from "../../../generate/read/extractRelations";

describe("getOneGassmaUpdateData", () => {
  it("should generate UpdateData with Partial NumberOperation support", () => {
    const result = getOneGassmaUpdateData("", "User");

    expect(result).toContain("export type GassmaUserUpdateData");
    expect(result).toContain("Partial<");
    expect(result).toContain(
      "[K in keyof GassmaUserUse]: GassmaUserUse[K] | Gassma.NumberOperation",
    );
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

    const result = getOneGassmaUpdateData("", "User", relations);

    expect(result).toContain('"posts"?:');
    expect(result).toContain("create?: GassmaPostUse | GassmaPostUse[]");
    expect(result).toContain(
      "connect?: GassmaPostWhereUse | GassmaPostWhereUse[]",
    );
  });

  it("should include limit property", () => {
    const result = getOneGassmaUpdateData("", "User");

    expect(result).toContain("limit?: number;");
  });
});
