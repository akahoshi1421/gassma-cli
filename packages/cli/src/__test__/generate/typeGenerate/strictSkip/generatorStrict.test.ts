import { describe, it, expect } from "vitest";
import { generater } from "../../../../generate/generator";
import type { RelationsConfig } from "../../../../generate/read/extractRelations";

const dictYaml: Record<string, Record<string, unknown[]>> = {
  User: {
    "id?": ["number"],
    name: ["string"],
  },
  Post: {
    "id?": ["number"],
    title: ["string"],
    authorId: ["number"],
  },
};

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

describe("generater strict mode", () => {
  const result = generater(
    dictYaml,
    relations,
    "",
    true,
    undefined,
    undefined,
    undefined,
    undefined,
    true,
  );

  it("should declare skip in the Gassma namespace", () => {
    expect(result).toContain("const skip: unique symbol;");
    expect(result).toContain("type SkipValue = typeof skip;");
    expect(result).toContain("type SkipOptional<T> =");
  });

  it("should add SkipValue across generated input types", () => {
    expect(result).toContain(
      '"id"?: number | null | GassmaUseridFilterConditions | Gassma.SkipValue;',
    );
    expect(result).toContain("where?: GassmaUserWhereUse | Gassma.SkipValue;");
    expect(result).toContain("data: Gassma.SkipOptional<");
  });

  it("should not touch output types", () => {
    expect(result).toContain("export type GassmaUserUse = {");
  });
});

describe("generater non-strict regression", () => {
  const result = generater(dictYaml, relations, "", true);

  it("should not contain any skip-related declarations", () => {
    expect(result).not.toContain("SkipValue");
    expect(result).not.toContain("SkipOptional");
    expect(result).not.toContain("unique symbol");
  });
});
