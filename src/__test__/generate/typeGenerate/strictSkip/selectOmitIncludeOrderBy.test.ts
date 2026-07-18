import { describe, it, expect } from "vitest";
import { getOneGassmaSelect } from "../../../../generate/typeGenerate/gassmaSelect/oneGassmaSelect";
import { getOneGassmaFindSelect } from "../../../../generate/typeGenerate/gassmaSelect/oneGassmaFindSelect";
import { getOneGassmaNumberSelect } from "../../../../generate/typeGenerate/gassmaSelect/oneGassmaNumberSelect";
import { getOneGassmaOmit } from "../../../../generate/typeGenerate/gassmaOmit/oneGassmaOmit";
import { getOneGassmaInclude } from "../../../../generate/typeGenerate/gassmaInclude/oneGassmaInclude";
import { getOneGassmaOrderBy } from "../../../../generate/typeGenerate/gassmaOrderBy/oneGassmaOrderBy";
import { getOneGassmaCountValue } from "../../../../generate/typeGenerate/gassmaCountValue/oneGassmaCountValue";
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
};

describe("strict Select", () => {
  it("should add SkipValue to select values", () => {
    const result = getOneGassmaSelect({ id: ["number"] }, "", "User", true);
    expect(result).toContain('"id"?: true | Gassma.SkipValue;');
  });

  it("should keep non-strict output unchanged", () => {
    expect(getOneGassmaSelect({ id: ["number"] }, "", "User")).not.toContain(
      "Skip",
    );
  });
});

describe("strict NumberSelect", () => {
  it("should add SkipValue to select values", () => {
    const result = getOneGassmaNumberSelect(
      { id: ["number"] },
      "",
      "User",
      true,
    );
    expect(result).toContain('"id"?: true | Gassma.SkipValue;');
  });

  it("should keep non-strict output unchanged", () => {
    expect(
      getOneGassmaNumberSelect({ id: ["number"] }, "", "User"),
    ).not.toContain("Skip");
  });
});

describe("strict Omit", () => {
  it("should add SkipValue to omit values", () => {
    const result = getOneGassmaOmit({ id: ["number"] }, "", "User", true);
    expect(result).toContain('"id"?: true | false | Gassma.SkipValue;');
  });

  it("should keep non-strict output unchanged", () => {
    expect(getOneGassmaOmit({ id: ["number"] }, "", "User")).not.toContain(
      "Skip",
    );
  });
});

describe("strict FindSelect", () => {
  const result = getOneGassmaFindSelect(
    { id: ["number"] },
    "",
    "User",
    relations,
    true,
  );

  it("should add SkipValue to scalar values", () => {
    expect(result).toContain('"id"?: true | Gassma.SkipValue;');
  });

  it("should add SkipValue to relation values and their options", () => {
    expect(result).toContain(
      '"posts"?: true | { select?: GassmaPostFindSelect | Gassma.SkipValue; omit?: GassmaPostOmit | Gassma.SkipValue; where?: GassmaPostWhereUse | Gassma.SkipValue; orderBy?: GassmaPostOrderBy | Gassma.SkipValue; take?: number | Gassma.SkipValue; skip?: number | Gassma.SkipValue; include?: GassmaPostInclude | Gassma.SkipValue; _count?: GassmaPostCountValue | Gassma.SkipValue } | Gassma.SkipValue;',
    );
  });

  it("should add SkipValue to _count", () => {
    expect(result).toContain(
      '"_count"?: GassmaUserCountValue | Gassma.SkipValue;',
    );
  });

  it("should keep non-strict output unchanged", () => {
    expect(
      getOneGassmaFindSelect({ id: ["number"] }, "", "User", relations),
    ).not.toContain("Skip");
  });
});

describe("strict Include", () => {
  const result = getOneGassmaInclude("", "User", relations, true);

  it("should add SkipValue to relation values and their options", () => {
    expect(result).toContain(
      '"posts"?: true | { select?: GassmaPostFindSelect | Gassma.SkipValue; omit?: GassmaPostOmit | Gassma.SkipValue; where?: GassmaPostWhereUse | Gassma.SkipValue; orderBy?: GassmaPostOrderBy | Gassma.SkipValue; take?: number | Gassma.SkipValue; skip?: number | Gassma.SkipValue; include?: GassmaPostInclude | Gassma.SkipValue; _count?: GassmaPostCountValue | Gassma.SkipValue } | Gassma.SkipValue;',
    );
    expect(result).toContain(
      '"_count"?: GassmaUserCountValue | Gassma.SkipValue;',
    );
  });

  it("should keep empty include unchanged", () => {
    expect(getOneGassmaInclude("", "Post", {}, true)).toContain(
      "export type GassmaPostInclude = {};",
    );
  });

  it("should keep non-strict output unchanged", () => {
    expect(getOneGassmaInclude("", "User", relations)).not.toContain("Skip");
  });
});

describe("strict OrderBy", () => {
  const result = getOneGassmaOrderBy(
    { id: ["number"] },
    "",
    "User",
    relations,
    true,
  );

  it("should add SkipValue to scalar values", () => {
    expect(result).toContain(
      '"id"?: "asc" | "desc" | Gassma.SortOrderInput | Gassma.SkipValue;',
    );
  });

  it("should add SkipValue to relation values", () => {
    expect(result).toContain(
      '"posts"?: GassmaPostOrderBy | { _count: "asc" | "desc" } | Gassma.SkipValue;',
    );
  });

  it("should add SkipValue to _count values", () => {
    expect(result).toContain(
      '"_count"?: { "posts"?: "asc" | "desc" | Gassma.SkipValue } | Gassma.SkipValue;',
    );
  });

  it("should keep non-strict output unchanged", () => {
    expect(
      getOneGassmaOrderBy({ id: ["number"] }, "", "User", relations),
    ).not.toContain("Skip");
  });
});

describe("strict CountValue", () => {
  it("should add SkipValue to relation count values", () => {
    const result = getOneGassmaCountValue("", "User", relations, true);
    expect(result).toContain(
      '"posts"?: true | { where?: GassmaPostWhereUse | Gassma.SkipValue } | Gassma.SkipValue;',
    );
  });

  it("should keep no-relation CountValue unchanged", () => {
    expect(getOneGassmaCountValue("", "Post", {}, true)).toContain(
      "export type GassmaPostCountValue = true;",
    );
  });

  it("should keep non-strict output unchanged", () => {
    expect(getOneGassmaCountValue("", "User", relations)).not.toContain("Skip");
  });
});
