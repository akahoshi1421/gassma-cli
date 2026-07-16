import { describe, it, expect } from "vitest";
import { getNestedWriteFields } from "../../../../generate/typeGenerate/util/getNestedWriteFields";
import type { RelationsConfig } from "../../../../generate/read/extractRelations";

describe("getNestedWriteFields", () => {
  const manyToOneRelations: RelationsConfig = {
    Post: {
      author: {
        type: "manyToOne",
        to: "User",
        field: "authorId",
        reference: "id",
      },
    },
  };

  it("should emit base operations for manyToOne", () => {
    const result = getNestedWriteFields("", "Post", manyToOneRelations);

    expect(result).toContain('"author"?:');
    expect(result).toContain("create?: GassmaUserUse");
    expect(result).toContain("connect?: GassmaUserWhereUse");
    expect(result).toContain(
      "connectOrCreate?: { where: GassmaUserWhereUse; create: GassmaUserUse }",
    );
  });

  it("should emit update/delete/disconnect for manyToOne (same as oneToOne)", () => {
    const result = getNestedWriteFields("", "Post", manyToOneRelations);

    expect(result).toContain("update?: Partial<GassmaUserUse>");
    expect(result).toContain("delete?: true");
    expect(result).toContain("disconnect?: true");
  });
});
