import { describe, expect, it } from "vitest";
import type { RelationsConfig } from "../../../generate/read/extractRelations";
import { getGassmaCommonTypes } from "../../../generate/typeGenerate/gassmaCommonTypes";
import { getOneGassmaFindResult } from "../../../generate/typeGenerate/gassmaFindResult/oneGassmaFindResult";

const userRelations: RelationsConfig = {
  User: {
    posts: {
      type: "oneToMany",
      to: "Post",
      field: "id",
      reference: "authorId",
    },
  },
};

// strictNullChecks が off だと undefined / unknown が任意プロパティのみの型にも
// object にも代入可能になるため、代入可能性で select の有無を判定すると
// 引数省略時に select 側の分岐へ落ちる。型の同一性で判定する。
describe("SelectGiven discriminator", () => {
  it("should treat unknown and undefined as no selection without using assignability", () => {
    const common = getGassmaCommonTypes();
    expect(common).toContain("type SelectGiven<S> =");
    expect(common).toContain("(<T>() => T extends S ? 1 : 2) extends");
    expect(common).toContain("[S] extends [undefined]");
  });

  it("should discriminate the FindResult select branch by SelectGiven", () => {
    const result = getOneGassmaFindResult("", "User", userRelations);
    expect(result).toContain("Gassma.SelectGiven<S> extends true");
    expect(result).not.toContain("(S extends GassmaUserFindSelect");
  });

  it("should keep the FindResult select branch distributive over unions of S", () => {
    const result = getOneGassmaFindResult("", "User", userRelations);
    expect(result).toContain("S extends unknown");
  });

  it("should apply the discriminator to both FindResultBase and FindResultCore", () => {
    const result = getOneGassmaFindResult("", "User", userRelations);
    expect(result.split("Gassma.SelectGiven<S> extends true")).toHaveLength(3);
  });

  it("should discriminate StripComputed and WithComputed by SelectGiven too", () => {
    const common = getGassmaCommonTypes();
    expect(common).toContain("type StripComputed<S, C>");
    expect(common).toContain("type WithComputed<Base, C, S, QO>");
    expect(common).not.toContain("S extends object");
  });
});
