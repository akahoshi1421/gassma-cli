import { describe, it, expect } from "vitest";
import { getGassmaCommonTypes } from "../../../generate/typeGenerate/gassmaCommonTypes";

describe("getGassmaCommonTypes", () => {
  const result = getGassmaCommonTypes();

  it("should generate RelationsConfig type", () => {
    expect(result).toContain("type RelationsConfig =");
  });

  it("should generate NumberOperation type", () => {
    expect(result).toContain("type NumberOperation =");
    expect(result).toContain("increment?: number");
    expect(result).toContain("decrement?: number");
    expect(result).toContain("multiply?: number");
    expect(result).toContain("divide?: number");
  });

  it("should generate SortOrderInput type", () => {
    expect(result).toContain("type SortOrderInput =");
    expect(result).toContain('sort: "asc" | "desc"');
    expect(result).toContain('nulls?: "first" | "last"');
  });

  it("should generate generic FilterConditions type", () => {
    expect(result).toContain("type FilterConditions<T> =");
    expect(result).toContain("equals?: T | FieldRef");
    expect(result).toContain("not?: T");
    expect(result).toContain("in?: T[]");
    expect(result).toContain("notIn?: T[]");
    expect(result).toContain("lt?: T | FieldRef");
    expect(result).toContain("lte?: T | FieldRef");
    expect(result).toContain("gt?: T | FieldRef");
    expect(result).toContain("gte?: T | FieldRef");
  });

  it("should generate a structural Lock type instead of depending on GoogleAppsScript", () => {
    expect(result).toContain("type Lock = {");
    expect(result).toContain("waitLock(timeoutInMillis: number): void;");
    expect(result).toContain("releaseLock(): void;");
    expect(result).toContain("hasLock(): boolean;");
    expect(result).not.toContain("tryLock");
    expect(result).not.toContain("GoogleAppsScript");
  });

  it("should generate GassmaTransactionOptions type", () => {
    expect(result).toContain("type GassmaTransactionOptions = {");
    expect(result).toContain("maxWait?: number");
    expect(result).toContain("timeout?: number");
    expect(result).toContain("rollback?: boolean");
    expect(result).not.toContain("isolationLevel");
  });

  it("should generate ManyReturn types", () => {
    expect(result).toContain("type ManyReturn =");
    expect(result).toContain("count: number");
    expect(result).toContain("type CreateManyReturn = ManyReturn");
    expect(result).toContain("type UpdateManyReturn = ManyReturn");
    expect(result).toContain("type DeleteManyReturn = ManyReturn");
    expect(result).not.toContain("type UpsertManyReturn = ManyReturn");
  });

  it("should not contain removed generic types", () => {
    expect(result).not.toContain("type IncludeData");
    expect(result).not.toContain("type CountSelectItem");
    expect(result).not.toContain("type CountValue");
    expect(result).not.toContain("type NestedWriteOperation");
    expect(result).not.toContain("type RelationOrderBy");
    expect(result).not.toContain("type RelationListFilter");
    expect(result).not.toContain("type RelationSingleFilter");
  });

  it("should not contain skip declarations by default", () => {
    expect(result).not.toContain("const skip");
    expect(result).not.toContain("SkipValue");
    expect(result).not.toContain("SkipOptional");
  });

  it("should generate RawValue type and the raw function", () => {
    expect(result).toContain("type RawValue = {");
    expect(result).toContain('readonly __gassmaRawValueBrand: "Gassma.raw";');
    expect(result).toContain("function raw(value: string): RawValue;");
  });

  it("should generate RawAllowed helper", () => {
    expect(result).toContain(
      "type RawAllowed<T> = { [K in keyof T]: T[K] | RawValue };",
    );
  });

  it("should generate Subset helper rejecting excess keys", () => {
    expect(result).toContain(
      "type Subset<T, U> = { [K in keyof T]: K extends keyof U ? T[K] : never };",
    );
  });

  describe("strict mode", () => {
    const strictResult = getGassmaCommonTypes(true);

    it("should declare skip symbol and SkipValue", () => {
      expect(strictResult).toContain("const skip: unique symbol;");
      expect(strictResult).toContain("type SkipValue = typeof skip;");
    });

    it("should declare SkipOptional helper", () => {
      expect(strictResult).toContain(
        "type SkipOptional<T> = { [K in keyof T]: {} extends Pick<T, K> ? T[K] | SkipValue : T[K] };",
      );
    });

    it("should add SkipValue to FilterConditions keys", () => {
      expect(strictResult).toContain("equals?: T | FieldRef | SkipValue");
      expect(strictResult).toContain("not?: T | SkipValue");
      expect(strictResult).toContain("in?: T[] | SkipValue");
      expect(strictResult).toContain("notIn?: T[] | SkipValue");
      expect(strictResult).toContain("lt?: T | FieldRef | SkipValue");
      expect(strictResult).toContain("lte?: T | FieldRef | SkipValue");
      expect(strictResult).toContain("gt?: T | FieldRef | SkipValue");
      expect(strictResult).toContain("gte?: T | FieldRef | SkipValue");
      expect(strictResult).toContain(
        "contains?: string | FieldRef | SkipValue",
      );
      expect(strictResult).toContain(
        "startsWith?: string | FieldRef | SkipValue",
      );
      expect(strictResult).toContain(
        "endsWith?: string | FieldRef | SkipValue",
      );
      expect(strictResult).toContain(
        'mode?: "default" | "insensitive" | SkipValue',
      );
    });

    it("should not add SkipValue to array element types", () => {
      expect(strictResult).not.toContain("(T | SkipValue)[]");
    });

    it("should keep raw declarations in strict mode", () => {
      expect(strictResult).toContain("function raw(value: string): RawValue;");
      expect(strictResult).toContain(
        "type RawAllowed<T> = { [K in keyof T]: T[K] | RawValue };",
      );
    });
  });
});
