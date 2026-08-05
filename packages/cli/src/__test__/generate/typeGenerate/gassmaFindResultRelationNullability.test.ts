import { describe, expect, it } from "vitest";
import type { RelationsConfig } from "../../../generate/read/extractRelations";
import { getOneGassmaFindResult } from "../../../generate/typeGenerate/gassmaFindResult/oneGassmaFindResult";

const postRelations: RelationsConfig = {
  Post: {
    author: {
      type: "manyToOne",
      to: "User",
      field: "authorId",
      reference: "id",
    },
  },
};

const countNull = (text: string, relationName: string) =>
  text.split("\n").filter((line) => line.includes(`"${relationName}": `))
    .length;

const nullableLines = (text: string, relationName: string) =>
  text
    .split("\n")
    .filter((line) => line.includes(`"${relationName}": `))
    .filter((line) => line.trimEnd().endsWith("| null;")).length;

describe("getOneGassmaFindResult relation nullability", () => {
  it("should not add null to a required manyToOne relation", () => {
    const result = getOneGassmaFindResult("", "Post", postRelations, {
      Post: [],
    });

    expect(countNull(result, "author")).toBeGreaterThan(0);
    expect(nullableLines(result, "author")).toBe(0);
  });

  it("should add null to an optional manyToOne relation", () => {
    const result = getOneGassmaFindResult("", "Post", postRelations, {
      Post: ["author"],
    });

    expect(nullableLines(result, "author")).toBe(countNull(result, "author"));
  });

  it("should apply the same rule to the select branch and the include branch", () => {
    const required = getOneGassmaFindResult("", "Post", postRelations, {
      Post: [],
    });

    expect(required).toContain(
      '"author": GassmaUserFindResult<Gassma.SelectOf<S[K]>, Gassma.IncludeOf<S[K]>, Gassma.OmitOf<S[K]>, O extends { "User": infer TO } ? TO extends GassmaUserOmit ? TO : {} : {}, O, CMap>;',
    );
    expect(required).toContain(
      '"author": GassmaUserFindResult<Gassma.SelectOf<I[K]>, Gassma.IncludeOf<I[K]>, Gassma.OmitOf<I[K]>, O extends { "User": infer TO } ? TO extends GassmaUserOmit ? TO : {} : {}, O, CMap>;',
    );
  });

  it("should keep oneToOne on the non fk side nullable", () => {
    const relations: RelationsConfig = {
      User: {
        profile: {
          type: "oneToOne",
          to: "Profile",
          field: "id",
          reference: "userId",
        },
      },
    };
    const result = getOneGassmaFindResult("", "User", relations, { User: [] });

    expect(nullableLines(result, "profile")).toBe(countNull(result, "profile"));
  });

  it("should keep list relations as arrays without null", () => {
    const relations: RelationsConfig = {
      User: {
        posts: {
          type: "oneToMany",
          to: "Post",
          field: "id",
          reference: "authorId",
        },
        tags: {
          type: "manyToMany",
          to: "Tag",
          field: "id",
          reference: "id",
        },
      },
    };
    const result = getOneGassmaFindResult("", "User", relations, { User: [] });

    expect(nullableLines(result, "posts")).toBe(0);
    expect(nullableLines(result, "tags")).toBe(0);
    expect(result).toContain("CMap>[];");
  });

  it("should treat a missing optional-relations entry as required", () => {
    const result = getOneGassmaFindResult("", "Post", postRelations);

    expect(nullableLines(result, "author")).toBe(0);
  });
});
