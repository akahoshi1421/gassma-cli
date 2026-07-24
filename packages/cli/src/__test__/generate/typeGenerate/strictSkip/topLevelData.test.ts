import { describe, it, expect } from "vitest";
import { getOneGassmaFindData } from "../../../../generate/typeGenerate/gassmaFindData/oneGassmaFindData";
import { getOneGassmaFindFirstData } from "../../../../generate/typeGenerate/gassmaFindData/oneGassmaFindFirstData";
import { getOneGassmaAggregateData } from "../../../../generate/typeGenerate/gassmaAggregateData/oneGassmaAggregateData";
import { getOneGassmaCountData } from "../../../../generate/typeGenerate/gassmaCountData/oneGassmaCountData";
import { getOneGassmaGroupByData } from "../../../../generate/typeGenerate/gassmaGroupByData/oneGassmaGroupByData";
import { getOneGassmaDeleteData } from "../../../../generate/typeGenerate/gassmaDeleteManyData/oneGassmaDeleteManyData";
import { getOneGassmaDeleteSingleData } from "../../../../generate/typeGenerate/gassmaDeleteManyData/oneGassmaDeleteSingleData";

describe("strict FindData", () => {
  const result = getOneGassmaFindData({ id: ["number"] }, "", "User", true);

  it("should add SkipValue to optional top-level arguments", () => {
    expect(result).toContain("where?: GassmaUserWhereUse | Gassma.SkipValue;");
    expect(result).toContain(
      "orderBy?: GassmaUserOrderBy | GassmaUserOrderBy[] | Gassma.SkipValue;",
    );
    expect(result).toContain("take?: number | Gassma.SkipValue;");
    expect(result).toContain("skip?: number | Gassma.SkipValue;");
    expect(result).toContain('distinct?: "id" | ("id")[] | Gassma.SkipValue;');
    expect(result).toContain("include?: GassmaUserInclude | Gassma.SkipValue;");
    expect(result).toContain(
      "cursor?: Gassma.SkipOptional<Partial<GassmaUserUse>> | Gassma.SkipValue;",
    );
    expect(result).toContain(
      "_count?: GassmaUserCountValue | Gassma.SkipValue;",
    );
  });

  it("should add SkipValue to select / omit branches", () => {
    expect(result).toContain(
      "({ select?: GassmaUserFindSelect | Gassma.SkipValue; omit?: never } | { select?: never; omit?: GassmaUserOmit | Gassma.SkipValue })",
    );
  });

  it("should keep non-strict output unchanged", () => {
    const plain = getOneGassmaFindData({ id: ["number"] }, "", "User");
    expect(plain).not.toContain("Skip");
  });
});

describe("strict FindFirstData", () => {
  const result = getOneGassmaFindFirstData(
    { id: ["number"] },
    "",
    "User",
    true,
  );

  it("should add SkipValue to optional top-level arguments", () => {
    expect(result).toContain("where?: GassmaUserWhereUse | Gassma.SkipValue;");
    expect(result).toContain(
      "orderBy?: GassmaUserOrderBy | GassmaUserOrderBy[] | Gassma.SkipValue;",
    );
    expect(result).toContain("take?: number | Gassma.SkipValue;");
    expect(result).toContain("skip?: number | Gassma.SkipValue;");
    expect(result).toContain('distinct?: "id" | ("id")[] | Gassma.SkipValue;');
    expect(result).toContain("include?: GassmaUserInclude | Gassma.SkipValue;");
    expect(result).toContain(
      "cursor?: Gassma.SkipOptional<Partial<GassmaUserUse>> | Gassma.SkipValue;",
    );
    expect(result).toContain(
      "_count?: GassmaUserCountValue | Gassma.SkipValue;",
    );
    expect(result).toContain(
      "({ select?: GassmaUserFindSelect | Gassma.SkipValue; omit?: never } | { select?: never; omit?: GassmaUserOmit | Gassma.SkipValue })",
    );
  });

  it("should keep non-strict output unchanged", () => {
    expect(
      getOneGassmaFindFirstData({ id: ["number"] }, "", "User"),
    ).not.toContain("Skip");
  });
});

describe("strict AggregateData", () => {
  const result = getOneGassmaAggregateData("", "User", true);

  it("should add SkipValue to optional top-level arguments", () => {
    expect(result).toContain("where?: GassmaUserWhereUse | Gassma.SkipValue;");
    expect(result).toContain(
      "orderBy?: GassmaUserOrderBy | GassmaUserOrderBy[] | Gassma.SkipValue;",
    );
    expect(result).toContain("take?: number | Gassma.SkipValue;");
    expect(result).toContain("skip?: number | Gassma.SkipValue;");
    expect(result).toContain(
      "cursor?: Gassma.SkipOptional<Partial<GassmaUserUse>> | Gassma.SkipValue;",
    );
    expect(result).toContain(
      "_avg?: GassmaUserNumberSelect | Gassma.SkipValue;",
    );
    expect(result).toContain("_count?: GassmaUserSelect | Gassma.SkipValue;");
    expect(result).toContain("_max?: GassmaUserSelect | Gassma.SkipValue;");
    expect(result).toContain("_min?: GassmaUserSelect | Gassma.SkipValue;");
    expect(result).toContain(
      "_sum?: GassmaUserNumberSelect | Gassma.SkipValue;",
    );
  });

  it("should keep non-strict output unchanged", () => {
    expect(getOneGassmaAggregateData("", "User")).not.toContain("Skip");
  });
});

describe("strict CountData", () => {
  const result = getOneGassmaCountData("", "User", true);

  it("should add SkipValue to optional top-level arguments", () => {
    expect(result).toContain("where?: GassmaUserWhereUse | Gassma.SkipValue;");
    expect(result).toContain(
      "orderBy?: GassmaUserOrderBy | GassmaUserOrderBy[] | Gassma.SkipValue;",
    );
    expect(result).toContain("take?: number | Gassma.SkipValue;");
    expect(result).toContain("skip?: number | Gassma.SkipValue;");
    expect(result).toContain(
      "cursor?: Gassma.SkipOptional<Partial<GassmaUserUse>> | Gassma.SkipValue;",
    );
  });

  it("should keep non-strict output unchanged", () => {
    expect(getOneGassmaCountData("", "User")).not.toContain("Skip");
  });
});

describe("strict GroupByData", () => {
  const result = getOneGassmaGroupByData({ id: ["number"] }, "", "User", true);

  it("should add SkipValue to having but not to by", () => {
    expect(result).toContain(
      "having?: GassmaUserHavingUse | Gassma.SkipValue;",
    );
    expect(result).toContain('by: "id" | ("id")[];');
  });

  it("should keep non-strict output unchanged", () => {
    expect(
      getOneGassmaGroupByData({ id: ["number"] }, "", "User"),
    ).not.toContain("Skip");
  });
});

describe("strict DeleteData", () => {
  const result = getOneGassmaDeleteData("", "User", true);

  it("should add SkipValue to where and limit", () => {
    expect(result).toContain("where?: GassmaUserWhereUse | Gassma.SkipValue;");
    expect(result).toContain("limit?: number | Gassma.SkipValue;");
  });

  it("should keep non-strict output unchanged", () => {
    expect(getOneGassmaDeleteData("", "User")).not.toContain("Skip");
  });
});

describe("strict DeleteSingleData", () => {
  const result = getOneGassmaDeleteSingleData("", "User", true);

  it("should not add SkipValue to required where", () => {
    expect(result).toContain("where: GassmaUserWhereUse;");
  });

  it("should add SkipValue to include / select / omit", () => {
    expect(result).toContain("include?: GassmaUserInclude | Gassma.SkipValue;");
    expect(result).toContain(
      "({ select?: GassmaUserSelect | Gassma.SkipValue; omit?: never } | { select?: never; omit?: GassmaUserOmit | Gassma.SkipValue })",
    );
  });

  it("should keep non-strict output unchanged", () => {
    expect(getOneGassmaDeleteSingleData("", "User")).not.toContain("Skip");
  });
});
