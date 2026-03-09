import { getOneGassmaUpdateSingleData } from "../../../generate/typeGenerate/gassmaUpdateData/oneGassmaUpdateSingleData";
import type { RelationsConfig } from "../../../generate/read/extractRelations";

describe("getOneGassmaUpdateSingleData", () => {
  it("should generate UpdateSingleData type", () => {
    const result = getOneGassmaUpdateSingleData("", "User");

    expect(result).toContain("declare type GassmaUserUpdateSingleData");
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

    expect(result).toContain("omit?: GassmaUserOmit;");
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
    expect(result).toContain("create?: GassmaPostUse | GassmaPostUse[]");
    expect(result).toContain(
      "connect?: GassmaPostWhereUse | GassmaPostWhereUse[]",
    );
  });
});
