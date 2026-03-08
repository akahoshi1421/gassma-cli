import { getOneGassmaOrderBy } from "../../../generate/typeGenerate/gassmaOrderBy/oneGassmaOrderBy";
import type { RelationsConfig } from "../../../generate/read/extractRelations";

describe("getOneGassmaOrderBy", () => {
  const sheetContent = {
    id: ["number"],
    name: ["string"],
    "email?": ["string"],
  };

  it("should generate OrderBy type", () => {
    const result = getOneGassmaOrderBy(sheetContent, "", "User");

    expect(result).toContain("declare type GassmaUserOrderBy");
  });

  it("should support SortOrderInput with nulls option", () => {
    const result = getOneGassmaOrderBy(sheetContent, "", "User");

    expect(result).toContain('"id"?: "asc" | "desc" | Gassma.SortOrderInput;');
  });

  it("should remove question mark from column names", () => {
    const result = getOneGassmaOrderBy(sheetContent, "", "User");

    expect(result).toContain('"email"?:');
    expect(result).not.toContain('"email?"');
  });

  it("should add relation fields for ordering", () => {
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

    const result = getOneGassmaOrderBy(sheetContent, "", "User", relations);

    expect(result).toContain('"posts"?: Gassma.RelationOrderBy;');
  });

  it("should add _count for relation count ordering", () => {
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

    const result = getOneGassmaOrderBy(sheetContent, "", "User", relations);

    expect(result).toContain('"_count"?: Gassma.RelationOrderBy;');
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

    const result = getOneGassmaOrderBy(sheetContent, "", "User", relations);

    expect(result).not.toContain("Gassma.RelationOrderBy");
  });
});
