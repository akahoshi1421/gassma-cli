import { describe, it, expect } from "vitest";
import { getOneSheetGassmaFilterConditions } from "../../../../generate/typeGenerate/gassmaFilterConditions/oneSheetGassmaFilterConditions";
import { getOneGassmaWhereUse } from "../../../../generate/typeGenerate/gassmaWhereUse/oneGassmaWhereUse";
import { getOneGassmaHavingCore } from "../../../../generate/typeGenerate/gassmaHavingCore/oneGassmaHavingCore";
import { getOneGassmaHavingUse } from "../../../../generate/typeGenerate/gassmaHavingUse/oneGassmaHavingUse";
import type { RelationsConfig } from "../../../../generate/read/extractRelations";

const relations: RelationsConfig = {
  User: {
    posts: {
      type: "oneToMany",
      to: "Post",
      field: "id",
      reference: "authorId",
    },
  },
  Post: {
    author: {
      type: "manyToOne",
      to: "User",
      field: "authorId",
      reference: "id",
    },
  },
};

describe("strict FilterConditions", () => {
  const result = getOneSheetGassmaFilterConditions(
    { id: ["number"] },
    "",
    "User",
    true,
  );

  it("should add SkipValue to every key", () => {
    expect(result).toContain(
      "equals?: number | Gassma.FieldRef | Gassma.SkipValue;",
    );
    expect(result).toContain("not?: number | Gassma.SkipValue;");
    expect(result).toContain("in?: number[] | Gassma.SkipValue;");
    expect(result).toContain("notIn?: number[] | Gassma.SkipValue;");
    expect(result).toContain(
      "lt?: number | Gassma.FieldRef | Gassma.SkipValue;",
    );
    expect(result).toContain(
      "lte?: number | Gassma.FieldRef | Gassma.SkipValue;",
    );
    expect(result).toContain(
      "gt?: number | Gassma.FieldRef | Gassma.SkipValue;",
    );
    expect(result).toContain(
      "gte?: number | Gassma.FieldRef | Gassma.SkipValue;",
    );
    expect(result).toContain(
      "contains?: string | Gassma.FieldRef | Gassma.SkipValue;",
    );
    expect(result).toContain(
      "startsWith?: string | Gassma.FieldRef | Gassma.SkipValue;",
    );
    expect(result).toContain(
      "endsWith?: string | Gassma.FieldRef | Gassma.SkipValue;",
    );
    expect(result).toContain(
      'mode?: "default" | "insensitive" | Gassma.SkipValue;',
    );
  });

  it("should not add SkipValue to array elements", () => {
    expect(result).not.toContain("(number | Gassma.SkipValue)[]");
  });

  it("should keep non-strict output unchanged", () => {
    const plain = getOneSheetGassmaFilterConditions(
      { id: ["number"] },
      "",
      "User",
    );
    expect(plain).not.toContain("SkipValue");
  });
});

describe("strict WhereUse", () => {
  const result = getOneGassmaWhereUse(
    { id: ["number"] },
    "",
    "User",
    relations,
    true,
  );

  it("should add SkipValue to column values", () => {
    expect(result).toContain(
      '"id"?: number | GassmaUseridFilterConditions | Gassma.SkipValue;',
    );
  });

  it("should add SkipValue to list relation filters", () => {
    expect(result).toContain(
      '"posts"?: { some?: GassmaPostWhereUse | Gassma.SkipValue; every?: GassmaPostWhereUse | Gassma.SkipValue; none?: GassmaPostWhereUse | Gassma.SkipValue } | Gassma.SkipValue;',
    );
  });

  it("should add SkipValue to single relation filters", () => {
    const postResult = getOneGassmaWhereUse(
      { authorId: ["number"] },
      "",
      "Post",
      relations,
      true,
    );
    expect(postResult).toContain(
      '"author"?: { is?: GassmaUserWhereUse | null | Gassma.SkipValue; isNot?: GassmaUserWhereUse | null | Gassma.SkipValue } | null | Gassma.SkipValue;',
    );
  });

  it("should add SkipValue to AND / OR / NOT", () => {
    expect(result).toContain(
      "AND?: GassmaUserWhereUse[] | GassmaUserWhereUse | Gassma.SkipValue;",
    );
    expect(result).toContain("OR?: GassmaUserWhereUse[] | Gassma.SkipValue;");
    expect(result).toContain(
      "NOT?: GassmaUserWhereUse[] | GassmaUserWhereUse | Gassma.SkipValue;",
    );
  });

  it("should keep non-strict output unchanged", () => {
    const plain = getOneGassmaWhereUse(
      { id: ["number"] },
      "",
      "User",
      relations,
    );
    expect(plain).not.toContain("SkipValue");
  });
});

describe("strict HavingCore", () => {
  const result = getOneGassmaHavingCore(
    { score: ["number"] },
    "",
    "User",
    true,
  );

  it("should add SkipValue to aggregate keys", () => {
    expect(result).toContain(
      "_avg?: Gassma.FilterConditions<number> | Gassma.SkipValue;",
    );
    expect(result).toContain(
      "_count?: Gassma.FilterConditions<number> | Gassma.SkipValue;",
    );
    expect(result).toContain(
      "_max?: GassmaUserscoreFilterConditions | Gassma.SkipValue;",
    );
    expect(result).toContain(
      "_min?: GassmaUserscoreFilterConditions | Gassma.SkipValue;",
    );
    expect(result).toContain(
      "_sum?: Gassma.FilterConditions<number> | Gassma.SkipValue;",
    );
  });

  it("should keep non-strict output unchanged", () => {
    const plain = getOneGassmaHavingCore({ score: ["number"] }, "", "User");
    expect(plain).not.toContain("SkipValue");
  });
});

describe("strict HavingUse", () => {
  const result = getOneGassmaHavingUse({ score: ["number"] }, "", "User", true);

  it("should add SkipValue to column values", () => {
    expect(result).toContain(
      '"score"?: number | GassmaUserscoreHavingCore | Gassma.SkipValue;',
    );
  });

  it("should add SkipValue to AND / OR / NOT", () => {
    expect(result).toContain(
      "AND?: GassmaUserHavingUse[] | GassmaUserHavingUse | Gassma.SkipValue;",
    );
    expect(result).toContain("OR?: GassmaUserHavingUse[] | Gassma.SkipValue;");
    expect(result).toContain(
      "NOT?: GassmaUserHavingUse[] | GassmaUserHavingUse | Gassma.SkipValue;",
    );
  });

  it("should keep non-strict output unchanged", () => {
    const plain = getOneGassmaHavingUse({ score: ["number"] }, "", "User");
    expect(plain).not.toContain("SkipValue");
  });
});
