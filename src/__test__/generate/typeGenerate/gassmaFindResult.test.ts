import { describe, it, expect } from "vitest";
import { getOneGassmaFindResult } from "../../../generate/typeGenerate/gassmaFindResult/oneGassmaFindResult";
import type { RelationsConfig } from "../../../generate/read/extractRelations";

describe("getOneGassmaFindResult", () => {
  it("should generate FindResult with 4 type parameters <S, I, QO, GO>", () => {
    const result = getOneGassmaFindResult("", "User");
    expect(result).toContain(
      "export type GassmaUserFindResult<S, I = undefined, QO = undefined, GO = {}>",
    );
  });

  it("should map oneToMany to TargetFindResult[] via SelectOf/IncludeOf/OmitOf", () => {
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
    const result = getOneGassmaFindResult("", "User", relations);
    expect(result).toContain(
      'K extends "posts" ? GassmaPostFindResult<Gassma.SelectOf<I[K]>, Gassma.IncludeOf<I[K]>, Gassma.OmitOf<I[K]>, {}>[]',
    );
  });

  it("should map oneToOne to TargetFindResult | null", () => {
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
    const result = getOneGassmaFindResult("", "User", relations);
    expect(result).toContain(
      'K extends "profile" ? GassmaProfileFindResult<Gassma.SelectOf<I[K]>, Gassma.IncludeOf<I[K]>, Gassma.OmitOf<I[K]>, {}> | null',
    );
  });

  it("should map manyToOne to TargetFindResult | null (FK constraints not enforced in spreadsheets)", () => {
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
    const result = getOneGassmaFindResult("", "Post", relations);
    expect(result).toContain(
      'K extends "author" ? GassmaUserFindResult<Gassma.SelectOf<I[K]>, Gassma.IncludeOf<I[K]>, Gassma.OmitOf<I[K]>, {}> | null',
    );
  });

  it("should resolve _count via Gassma.CountResult", () => {
    const result = getOneGassmaFindResult("", "User");
    expect(result).toContain('K extends "_count" ? Gassma.CountResult<I[K]>');
  });

  it("should use ResolveOmitKeys for omit/globalOmit reflection", () => {
    const result = getOneGassmaFindResult("", "User");
    expect(result).toContain("Gassma.ResolveOmitKeys<GO, QO>");
  });

  it("should index I via I[K] (not literal) to avoid TS2536", () => {
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
    const result = getOneGassmaFindResult("", "User", relations);
    expect(result).toContain("Gassma.SelectOf<I[K]>");
    expect(result).not.toContain('Gassma.SelectOf<I["posts"]>');
  });

  it("should prepend schemaName to type names", () => {
    const result = getOneGassmaFindResult("Test", "User");
    expect(result).toContain("export type GassmaTestUserFindResult");
  });
});
