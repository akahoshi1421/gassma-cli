import { describe, expect, it } from "vitest";
import type { RelationsConfig } from "../../../generate/read/extractRelations";
import { getOneGassmaFindResult } from "../../../generate/typeGenerate/gassmaFindResult/oneGassmaFindResult";

const userRelations: RelationsConfig = {
  User: {
    posts: {
      type: "oneToMany",
      to: "Post",
      field: "id",
      reference: "authorId",
    },
    profile: {
      type: "oneToOne",
      to: "Profile",
      field: "id",
      reference: "userId",
    },
  },
};

describe("getOneGassmaFindResult relation lookup map", () => {
  it("should resolve relations via a single lookup map instead of a conditional chain", () => {
    const result = getOneGassmaFindResult("", "User", userRelations);
    expect(result).toContain('K extends "posts" | "profile" ? {');
    expect(result).toContain("}[K] :");
    expect(result).not.toContain('K extends "posts" ? Gassma');
    expect(result).not.toContain('K extends "profile" ? Gassma');
  });

  it("should map manyToMany to a TargetFindResult[] map entry", () => {
    const relations: RelationsConfig = {
      Post: {
        tags: {
          type: "manyToMany",
          to: "Tag",
          field: "id",
          reference: "id",
        },
      },
    };
    const result = getOneGassmaFindResult("", "Post", relations);
    expect(result).toContain(
      '"tags": GassmaTagFindResult<Gassma.SelectOf<I[K]>, Gassma.IncludeOf<I[K]>, Gassma.OmitOf<I[K]>, O extends { "Tag": infer TO } ? TO extends GassmaTagOmit ? TO : {} : {}, O, CMap>[];',
    );
  });

  it("should keep _count resolution after the lookup map", () => {
    const result = getOneGassmaFindResult("", "User", userRelations);
    expect(result).toContain(
      '}[K] :\n          K extends "_count" ? Gassma.CountResult<S[K]>',
    );
    expect(result).toContain(
      '}[K] :\n          K extends "_count" ? Gassma.CountResult<I[K]>',
    );
  });

  it("should emit no lookup map for a model without relations", () => {
    const result = getOneGassmaFindResult("", "Member");
    expect(result).not.toContain("}[K]");
    expect(result).toContain('K extends "_count" ? Gassma.CountResult<S[K]>');
    expect(result).toContain('K extends "_count" ? Gassma.CountResult<I[K]>');
    expect(result).toContain('K extends "_count" ? K : never');
  });
});
