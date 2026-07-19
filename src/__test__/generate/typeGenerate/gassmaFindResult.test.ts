import { describe, expect, it } from "vitest";
import type { RelationsConfig } from "../../../generate/read/extractRelations";
import { getOneGassmaFindResult } from "../../../generate/typeGenerate/gassmaFindResult/oneGassmaFindResult";

describe("getOneGassmaFindResult", () => {
  it("should generate a structural FindResultBase with 5 type parameters", () => {
    const result = getOneGassmaFindResult("", "User");
    expect(result).toContain(
      "export type GassmaUserFindResultBase<S, I = undefined, QO = undefined, GO = {}, O = {}>",
    );
  });

  it("should generate a FindResultCore with a CMap type parameter", () => {
    const result = getOneGassmaFindResult("", "User");
    expect(result).toContain(
      "export type GassmaUserFindResultCore<S, I = undefined, QO = undefined, GO = {}, O = {}, CMap = {}>",
    );
  });

  it("should wrap FindResult in WithComputed, stripping computed keys from the select", () => {
    const result = getOneGassmaFindResult("", "User");
    expect(result).toContain(
      "export type GassmaUserFindResult<S, I = undefined, QO = undefined, GO = {}, O = {}, CMap = {}> = Gassma.WithComputed<",
    );
    expect(result).toContain(
      'GassmaUserFindResultCore<Gassma.StripComputed<S, Gassma.At<CMap, "User">>, I, QO, GO, O, CMap>',
    );
    expect(result).toContain('Gassma.At<CMap, "User">');
  });

  it("should map oneToMany to computed TargetFindResult[] threading CMap", () => {
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
      'K extends "posts" ? GassmaPostFindResult<Gassma.SelectOf<I[K]>, Gassma.IncludeOf<I[K]>, Gassma.OmitOf<I[K]>, O extends { "Post": infer TO } ? TO extends GassmaPostOmit ? TO : {} : {}, O, CMap>[]',
    );
  });

  it("should map oneToOne to computed TargetFindResult | null threading CMap", () => {
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
      'K extends "profile" ? GassmaProfileFindResult<Gassma.SelectOf<I[K]>, Gassma.IncludeOf<I[K]>, Gassma.OmitOf<I[K]>, O extends { "Profile": infer TO } ? TO extends GassmaProfileOmit ? TO : {} : {}, O, CMap> | null',
    );
  });

  it("should map manyToOne to computed TargetFindResult | null threading CMap", () => {
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
      'K extends "author" ? GassmaUserFindResult<Gassma.SelectOf<I[K]>, Gassma.IncludeOf<I[K]>, Gassma.OmitOf<I[K]>, O extends { "User": infer TO } ? TO extends GassmaUserOmit ? TO : {} : {}, O, CMap> | null',
    );
  });

  it("should keep FindResultBase relation branches structural (no CMap)", () => {
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
      'K extends "posts" ? GassmaPostFindResultBase<Gassma.SelectOf<I[K]>, Gassma.IncludeOf<I[K]>, Gassma.OmitOf<I[K]>, O extends { "Post": infer TO } ? TO extends GassmaPostOmit ? TO : {} : {}, O>[]',
    );
  });

  it("should pass target model globalOmit and full config to select-relation branches", () => {
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
      'K extends "posts" ? GassmaPostFindResult<Gassma.SelectOf<S[K]>, Gassma.IncludeOf<S[K]>, Gassma.OmitOf<S[K]>, O extends { "Post": infer TO } ? TO extends GassmaPostOmit ? TO : {} : {}, O, CMap>[]',
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
