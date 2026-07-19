import { describe, it, expect } from "vitest";
import { buildCreateDataType } from "../../../../generate/typeGenerate/util/buildCreateDataType";
import { getNestedWriteFields } from "../../../../generate/typeGenerate/util/getNestedWriteFields";
import { getOneGassmaCreate } from "../../../../generate/typeGenerate/gassmaCreate/oneGassmaCreate";
import { getOneGassmaCreateMany } from "../../../../generate/typeGenerate/gassmaCreateMany/oneGassmaCreateMany";
import { getOneGassmaCreateManyAndReturnData } from "../../../../generate/typeGenerate/gassmaCreateMany/oneGassmaCreateManyAndReturnData";
import { getOneGassmaUpdateData } from "../../../../generate/typeGenerate/gassmaUpdateData/oneGassmaUpdateData";
import { getOneGassmaUpdateSingleData } from "../../../../generate/typeGenerate/gassmaUpdateData/oneGassmaUpdateSingleData";
import { getOneGassmaUpsertSingleData } from "../../../../generate/typeGenerate/gassmaUpsertData/oneGassmaUpsertSingleData";
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

const userContent: Record<string, unknown[]> = {
  id: ["number"],
  name: ["string"],
};

const dictYaml: Record<string, Record<string, unknown[]>> = {
  User: userContent,
  Post: { id: ["number"], title: ["string"] },
};

const idNumOp = '(K extends "id" ? Gassma.NumberOperation : never)';
const postUpdateData = `Gassma.SkipOptional<Partial<{ [K in keyof GassmaPostUse]: GassmaPostUse[K] | ${idNumOp} }>>`;
const userUpdateData = `Gassma.SkipOptional<Partial<{ [K in keyof GassmaUserUse]: GassmaUserUse[K] | ${idNumOp} }>>`;

describe("strict buildCreateDataType", () => {
  it("should wrap base type with SkipOptional", () => {
    const result = buildCreateDataType("", "User", relations, true);
    expect(result).toContain("Gassma.SkipOptional<GassmaUserUse>");
  });

  it("should wrap FK-omitted base type with SkipOptional", () => {
    const result = buildCreateDataType("", "Post", relations, true);
    expect(result).toContain(
      'Gassma.SkipOptional<Omit<GassmaPostUse, "authorId">>',
    );
  });

  it("should keep FK Pick branch without SkipValue", () => {
    const result = buildCreateDataType("", "Post", relations, true);
    expect(result).toContain('Pick<GassmaPostUse, "authorId">');
    expect(result).not.toContain(
      'Pick<GassmaPostUse, "authorId"> | Gassma.SkipValue',
    );
  });

  it("should add SkipValue to FK relation operations", () => {
    const result = buildCreateDataType("", "Post", relations, true);
    expect(result).toContain(
      '"author": { create?: Gassma.SkipOptional<GassmaUserUse> | Gassma.SkipValue; connect?: GassmaUserWhereUse | Gassma.SkipValue; connectOrCreate?: { where: GassmaUserWhereUse; create: Gassma.SkipOptional<GassmaUserUse> } | Gassma.SkipValue }',
    );
  });

  it("should keep non-strict output unchanged", () => {
    expect(buildCreateDataType("", "Post", relations)).not.toContain("Skip");
  });
});

describe("strict getNestedWriteFields", () => {
  const createFields = getNestedWriteFields(
    "",
    "User",
    relations,
    "create",
    true,
  );
  const updateFields = getNestedWriteFields(
    "",
    "User",
    relations,
    "update",
    true,
    dictYaml,
  );

  it("should add SkipValue to the relation key", () => {
    expect(createFields).toContain("} | Gassma.SkipValue;\n");
  });

  it("should add SkipValue to create context operations", () => {
    expect(createFields).toContain(
      'create?: Gassma.SkipOptional<Omit<GassmaPostUse, "authorId">> | Gassma.SkipOptional<Omit<GassmaPostUse, "authorId">>[] | Gassma.SkipValue',
    );
    expect(createFields).toContain(
      'createMany?: { data: Gassma.SkipOptional<Omit<GassmaPostUse, "authorId">>[] } | Gassma.SkipValue',
    );
    expect(createFields).toContain(
      "connect?: GassmaPostWhereUse | GassmaPostWhereUse[] | Gassma.SkipValue",
    );
    expect(createFields).toContain(
      'connectOrCreate?: { where: GassmaPostWhereUse; create: Gassma.SkipOptional<Omit<GassmaPostUse, "authorId">> } | { where: GassmaPostWhereUse; create: Gassma.SkipOptional<Omit<GassmaPostUse, "authorId">> }[] | Gassma.SkipValue',
    );
  });

  it("should add SkipValue to update-only operations for list relations", () => {
    expect(updateFields).toContain(
      `update?: { where: GassmaPostWhereUse; data: ${postUpdateData} } | { where: GassmaPostWhereUse; data: ${postUpdateData} }[] | Gassma.SkipValue`,
    );
    expect(updateFields).toContain(
      "delete?: GassmaPostWhereUse | GassmaPostWhereUse[] | Gassma.SkipValue",
    );
    expect(updateFields).toContain(
      "deleteMany?: GassmaPostWhereUse | GassmaPostWhereUse[] | Gassma.SkipValue",
    );
    expect(updateFields).toContain(
      "disconnect?: GassmaPostWhereUse | GassmaPostWhereUse[] | Gassma.SkipValue",
    );
    expect(updateFields).toContain(
      "set?: GassmaPostWhereUse[] | Gassma.SkipValue",
    );
  });

  it("should add SkipValue to update-only operations for single relations", () => {
    const postUpdate = getNestedWriteFields(
      "",
      "Post",
      relations,
      "update",
      true,
      dictYaml,
    );
    expect(postUpdate).toContain(
      `update?: ${userUpdateData} | Gassma.SkipValue`,
    );
    expect(postUpdate).toContain("delete?: true | Gassma.SkipValue");
    expect(postUpdate).toContain("disconnect?: true | Gassma.SkipValue");
  });

  it("should keep SkipOptional over plain Partial without dictYaml", () => {
    const postUpdate = getNestedWriteFields(
      "",
      "Post",
      relations,
      "update",
      true,
    );
    expect(postUpdate).toContain(
      "update?: Gassma.SkipOptional<Partial<GassmaUserUse>> | Gassma.SkipValue",
    );
  });

  it("should keep non-strict output unchanged", () => {
    expect(getNestedWriteFields("", "User", relations, "update")).not.toContain(
      "Skip",
    );
  });
});

describe("strict CreateData", () => {
  const result = getOneGassmaCreate("", "User", relations, true);

  it("should not add SkipValue to data itself", () => {
    expect(result).toContain("data: Gassma.SkipOptional<GassmaUserUse>");
  });

  it("should add SkipValue to include / select / omit", () => {
    expect(result).toContain("include?: GassmaUserInclude | Gassma.SkipValue;");
    expect(result).toContain(
      "({ select?: GassmaUserSelect | Gassma.SkipValue; omit?: never } | { select?: never; omit?: GassmaUserOmit | Gassma.SkipValue })",
    );
  });

  it("should keep non-strict output unchanged", () => {
    expect(getOneGassmaCreate("", "User", relations)).not.toContain("Skip");
  });
});

describe("strict CreateManyData", () => {
  it("should wrap data elements with SkipOptional", () => {
    const result = getOneGassmaCreateMany("", "User", true);
    expect(result).toContain("data: Gassma.SkipOptional<GassmaUserUse>[];");
  });

  it("should keep non-strict output unchanged", () => {
    expect(getOneGassmaCreateMany("", "User")).not.toContain("Skip");
  });
});

describe("strict CreateManyAndReturnData", () => {
  const result = getOneGassmaCreateManyAndReturnData("", "User", true);

  it("should wrap data elements and add SkipValue to options", () => {
    expect(result).toContain("data: Gassma.SkipOptional<GassmaUserUse>[];");
    expect(result).toContain("include?: GassmaUserInclude | Gassma.SkipValue;");
    expect(result).toContain(
      "({ select?: GassmaUserSelect | Gassma.SkipValue; omit?: never } | { select?: never; omit?: GassmaUserOmit | Gassma.SkipValue })",
    );
  });

  it("should keep non-strict output unchanged", () => {
    expect(getOneGassmaCreateManyAndReturnData("", "User")).not.toContain(
      "Skip",
    );
  });
});

describe("strict UpdateData", () => {
  const result = getOneGassmaUpdateData("", "User", userContent, true);

  it("should add SkipValue to data values and optional arguments", () => {
    expect(result).toContain(
      `data: Partial<{ [K in keyof GassmaUserUse]: GassmaUserUse[K] | ${idNumOp} | Gassma.SkipValue }>;`,
    );
    expect(result).toContain("where?: GassmaUserWhereUse | Gassma.SkipValue;");
    expect(result).toContain("limit?: number | Gassma.SkipValue;");
  });

  it("should keep non-strict output unchanged", () => {
    expect(getOneGassmaUpdateData("", "User", userContent)).not.toContain(
      "Skip",
    );
  });
});

describe("strict UpdateSingleData", () => {
  const result = getOneGassmaUpdateSingleData(
    "",
    "User",
    userContent,
    relations,
    true,
    dictYaml,
  );

  it("should not add SkipValue to required where", () => {
    expect(result).toContain("where: GassmaUserWhereUse;");
  });

  it("should add SkipValue to data values", () => {
    expect(result).toContain(
      `Partial<{ [K in keyof GassmaUserUse]: GassmaUserUse[K] | ${idNumOp} | Gassma.SkipValue }>`,
    );
  });

  it("should add SkipValue to include / select / omit", () => {
    expect(result).toContain("include?: GassmaUserInclude | Gassma.SkipValue;");
    expect(result).toContain(
      "({ select?: GassmaUserSelect | Gassma.SkipValue; omit?: never } | { select?: never; omit?: GassmaUserOmit | Gassma.SkipValue })",
    );
  });

  it("should keep non-strict output unchanged", () => {
    expect(
      getOneGassmaUpdateSingleData("", "User", userContent, relations),
    ).not.toContain("Skip");
  });
});

describe("strict UpsertSingleData", () => {
  const result = getOneGassmaUpsertSingleData(
    "",
    "User",
    userContent,
    relations,
    true,
    dictYaml,
  );

  it("should not add SkipValue to required where / create / update themselves", () => {
    expect(result).toContain("where: GassmaUserWhereUse;");
    expect(result).toContain("create: Gassma.SkipOptional<GassmaUserUse>");
    expect(result).toContain(
      `update: Partial<{ [K in keyof GassmaUserUse]: GassmaUserUse[K] | ${idNumOp} | Gassma.SkipValue }>`,
    );
  });

  it("should add SkipValue to include / select / omit", () => {
    expect(result).toContain("include?: GassmaUserInclude | Gassma.SkipValue;");
    expect(result).toContain(
      "({ select?: GassmaUserSelect | Gassma.SkipValue; omit?: never } | { select?: never; omit?: GassmaUserOmit | Gassma.SkipValue })",
    );
  });

  it("should keep non-strict output unchanged", () => {
    expect(
      getOneGassmaUpsertSingleData("", "User", userContent, relations),
    ).not.toContain("Skip");
  });
});
