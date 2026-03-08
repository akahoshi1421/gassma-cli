import { getOneGassmaUpsertSingleData } from "../../../generate/typeGenerate/gassmaUpsertData/oneGassmaUpsertSingleData";
import type { RelationsConfig } from "../../../generate/read/extractRelations";

describe("getOneGassmaUpsertSingleData", () => {
  it("should generate UpsertSingleData type", () => {
    const result = getOneGassmaUpsertSingleData("User");

    expect(result).toContain("declare type GassmaUserUpsertSingleData");
  });

  it("should include where property", () => {
    const result = getOneGassmaUpsertSingleData("User");

    expect(result).toContain("where: GassmaUserWhereUse;");
  });

  it("should include create property", () => {
    const result = getOneGassmaUpsertSingleData("User");

    expect(result).toContain("create: GassmaUserUse");
  });

  it("should include update with NumberOperation", () => {
    const result = getOneGassmaUpsertSingleData("User");

    expect(result).toContain(
      "[K in keyof GassmaUserUse]: GassmaUserUse[K] | Gassma.NumberOperation",
    );
  });

  it("should include select property", () => {
    const result = getOneGassmaUpsertSingleData("User");

    expect(result).toContain("select?: GassmaUserSelect;");
  });

  it("should include include property", () => {
    const result = getOneGassmaUpsertSingleData("User");

    expect(result).toContain("include?: Gassma.IncludeData;");
  });

  it("should include omit property", () => {
    const result = getOneGassmaUpsertSingleData("User");

    expect(result).toContain("omit?: GassmaUserOmit;");
  });

  it("should add nested write operations for relations in create and update", () => {
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

    const result = getOneGassmaUpsertSingleData("User", relations);

    expect(result).toContain('"posts"?: Gassma.NestedWriteOperation');
  });
});
