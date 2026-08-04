import { describe, expect, it } from "vitest";
import { getOneGassmaController } from "../../../generate/typeGenerate/gassmaController/oneGassmaController";

describe("getOneGassmaController no-arg overloads", () => {
  const result = getOneGassmaController("", "User", ["id"]);
  const resNoArg = `GassmaUserFindResult<unknown, unknown, unknown, GO, O, CMap>`;

  it("should allow findMany without arguments", () => {
    expect(result).toContain(`findMany(): ${resNoArg}[];`);
  });

  it("should allow findFirst without arguments", () => {
    expect(result).toContain(`findFirst(): ${resNoArg} | null;`);
  });

  it("should allow findFirstOrThrow without arguments", () => {
    expect(result).toContain(`findFirstOrThrow(): ${resNoArg};`);
  });

  it("should allow count without arguments", () => {
    expect(result).toContain("count(): number;");
  });

  it("should allow deleteMany without arguments", () => {
    expect(result).toContain("deleteMany(): DeleteManyReturn;");
  });

  it("should keep the argument-taking signatures next to the no-arg overloads", () => {
    expect(result).toContain(
      `findMany<T extends GassmaUserFindManyData & Gassma.ComputedArgs<Gassma.At<CMap, "User">>>(findData: T & Gassma.Subset<T, GassmaUserFindManyData & Gassma.ComputedArgs<Gassma.At<CMap, "User">>>)`,
    );
    expect(result).toContain(
      "count<T extends GassmaUserCountData>(coutData: T & Gassma.Subset<T, GassmaUserCountData>): GassmaUserCountResult<T>;",
    );
    expect(result).toContain(
      "deleteMany(deleteData: GassmaUserDeleteData): DeleteManyReturn;",
    );
  });

  it("should prefix schema name in no-arg return types", () => {
    const prefixed = getOneGassmaController("Hoge", "User", ["id"]);
    expect(prefixed).toContain(
      "findMany(): GassmaHogeUserFindResult<unknown, unknown, unknown, GO, O, CMap>[];",
    );
  });

  it("should not add no-arg overloads to any other operation", () => {
    expect(result).not.toContain("create():");
    expect(result).not.toContain("createMany():");
    expect(result).not.toContain("createManyAndReturn():");
    expect(result).not.toContain("update():");
    expect(result).not.toContain("updateMany():");
    expect(result).not.toContain("updateManyAndReturn():");
    expect(result).not.toContain("upsert():");
    expect(result).not.toContain("delete():");
    expect(result).not.toContain("aggregate():");
    expect(result).not.toContain("groupBy():");
  });
});
