import { getGassmaErrorClasses } from "../../../generate/typeGenerate/gassmaErrorClasses";

describe("getGassmaErrorClasses", () => {
  const result = getGassmaErrorClasses();

  it("should include GassmaSkipNegativeError", () => {
    expect(result).toContain("class GassmaSkipNegativeError extends Error");
    expect(result).toContain("constructor(value: number)");
  });

  it("should include GassmaLimitNegativeError", () => {
    expect(result).toContain("class GassmaLimitNegativeError extends Error");
  });

  it("should include NotFoundError", () => {
    expect(result).toContain("class NotFoundError extends Error");
  });

  it("should include GassmaFindSelectOmitConflictError", () => {
    expect(result).toContain(
      "class GassmaFindSelectOmitConflictError extends Error",
    );
  });

  it("should include GassmaInValidColumnValueError", () => {
    expect(result).toContain(
      "class GassmaInValidColumnValueError extends Error",
    );
  });

  it("should include GassmaGroupByHavingDontWriteByError", () => {
    expect(result).toContain(
      "class GassmaGroupByHavingDontWriteByError extends Error",
    );
  });

  it("should include aggregate error classes with inheritance", () => {
    expect(result).toContain("class GassmaAggregateMaxError extends Error");
    expect(result).toContain(
      "class GassmaAggregateMinError extends GassmaAggregateMaxError",
    );
    expect(result).toContain(
      "class GassmaAggregateSumError extends GassmaAggregateMaxError",
    );
    expect(result).toContain(
      "class GassmaAggregateAvgError extends GassmaAggregateMaxError",
    );
    expect(result).toContain("class GassmaAggregateTypeError extends Error");
    expect(result).toContain("class GassmaAggregateSumTypeError extends Error");
    expect(result).toContain(
      "class GassmaAggregateAvgTypeError extends GassmaAggregateSumTypeError",
    );
  });

  it("should include relation validation errors", () => {
    expect(result).toContain("class RelationSheetNotFoundError extends Error");
    expect(result).toContain(
      "class RelationMissingPropertyError extends Error",
    );
    expect(result).toContain(
      "class RelationInvalidPropertyTypeError extends Error",
    );
    expect(result).toContain("class RelationInvalidTypeError extends Error");
    expect(result).toContain("class RelationColumnNotFoundError extends Error");
  });

  it("should include include-related errors", () => {
    expect(result).toContain(
      "class IncludeWithoutRelationsError extends Error",
    );
    expect(result).toContain(
      "class IncludeInvalidOptionTypeError extends Error",
    );
    expect(result).toContain(
      "class IncludeSelectOmitConflictError extends Error",
    );
    expect(result).toContain(
      "class IncludeSelectIncludeConflictError extends Error",
    );
  });

  it("should include where relation errors", () => {
    expect(result).toContain(
      "class WhereRelationInvalidFilterError extends Error",
    );
    expect(result).toContain(
      "class WhereRelationWithoutContextError extends Error",
    );
  });

  it("should include referential action errors", () => {
    expect(result).toContain(
      "class RelationOnDeleteRestrictError extends Error",
    );
    expect(result).toContain(
      "class RelationInvalidOnDeleteError extends Error",
    );
    expect(result).toContain(
      "class RelationOnUpdateRestrictError extends Error",
    );
    expect(result).toContain(
      "class RelationInvalidOnUpdateError extends Error",
    );
  });

  it("should include nested write errors", () => {
    expect(result).toContain(
      "class NestedWriteConnectNotFoundError extends Error",
    );
    expect(result).toContain(
      "class NestedWriteRelationNotFoundError extends Error",
    );
    expect(result).toContain(
      "class NestedWriteInvalidOperationError extends Error",
    );
    expect(result).toContain(
      "class NestedWriteWithoutRelationsError extends Error",
    );
  });

  it("should include orderBy errors", () => {
    expect(result).toContain(
      "class RelationOrderByUnsupportedTypeError extends Error",
    );
    expect(result).toContain(
      "class RelationOrderByCountUnsupportedTypeError extends Error",
    );
  });

  it("should include relation errors from relationError.ts", () => {
    expect(result).toContain("class GassmaRelationNotFoundError extends Error");
    expect(result).toContain(
      "class GassmaTargetSheetNotFoundError extends Error",
    );
    expect(result).toContain("class GassmaThroughRequiredError extends Error");
    expect(result).toContain(
      "class GassmaIncludeSelectConflictError extends Error",
    );
    expect(result).toContain(
      "class GassmaRelationDuplicateError extends Error",
    );
  });
});
