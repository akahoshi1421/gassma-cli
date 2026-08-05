type ErrorClassDef = {
  name: string;
  extends: string;
  params: string;
  members?: string[];
};

const errorClassDefinitions: ErrorClassDef[] = [
  {
    name: "GassmaSkipNegativeError",
    extends: "Error",
    params: "value: number",
  },
  { name: "GassmaFindFirstTakeError", extends: "Error", params: "" },
  {
    name: "GassmaLimitNegativeError",
    extends: "Error",
    params: "value: number",
  },
  { name: "NotFoundError", extends: "Error", params: "" },
  { name: "GassmaFindSelectOmitConflictError", extends: "Error", params: "" },
  { name: "GassmaInValidColumnValueError", extends: "Error", params: "" },
  { name: "GassmaGroupByHavingDontWriteByError", extends: "Error", params: "" },
  {
    name: "GassmaGroupByOrderByRequiredError",
    extends: "Error",
    params: "...paginationArguments: string[]",
  },
  { name: "GassmaAggregateMaxError", extends: "Error", params: "" },
  {
    name: "GassmaAggregateMinError",
    extends: "GassmaAggregateMaxError",
    params: "",
  },
  {
    name: "GassmaAggregateSumError",
    extends: "GassmaAggregateMaxError",
    params: "",
  },
  {
    name: "GassmaAggregateAvgError",
    extends: "GassmaAggregateMaxError",
    params: "",
  },
  { name: "GassmaAggregateTypeError", extends: "Error", params: "" },
  { name: "GassmaAggregateSumTypeError", extends: "Error", params: "" },
  {
    name: "GassmaAggregateAvgTypeError",
    extends: "GassmaAggregateSumTypeError",
    params: "",
  },
  {
    name: "GassmaAggregateSelectionRequiredError",
    extends: "Error",
    params: "",
  },
  {
    name: "RelationSheetNotFoundError",
    extends: "Error",
    params: "sheetName: string",
  },
  {
    name: "RelationMissingPropertyError",
    extends: "Error",
    params: "sheetName: string, relationName: string, property: string",
  },
  {
    name: "RelationInvalidPropertyTypeError",
    extends: "Error",
    params:
      "sheetName: string, relationName: string, property: string, expectedType: string",
  },
  {
    name: "RelationInvalidTypeError",
    extends: "Error",
    params: "sheetName: string, relationName: string, value: string",
  },
  {
    name: "RelationColumnNotFoundError",
    extends: "Error",
    params: "sheetName: string, columnName: string",
  },
  { name: "IncludeWithoutRelationsError", extends: "Error", params: "" },
  {
    name: "IncludeInvalidOptionTypeError",
    extends: "Error",
    params: "relationName: string, option: string, expectedType: string",
  },
  {
    name: "IncludeSelectOmitConflictError",
    extends: "Error",
    params: "relationName: string",
  },
  {
    name: "IncludeSelectIncludeConflictError",
    extends: "Error",
    params: "relationName: string",
  },
  {
    name: "WhereRelationInvalidFilterError",
    extends: "Error",
    params: "relationName: string, relationType: string, filterType: string",
  },
  { name: "WhereRelationWithoutContextError", extends: "Error", params: "" },
  {
    name: "RelationOnDeleteRestrictError",
    extends: "Error",
    params: "relationName: string",
  },
  {
    name: "RelationInvalidOnDeleteError",
    extends: "Error",
    params: "sheetName: string, relationName: string, value: string",
  },
  {
    name: "RelationOnUpdateRestrictError",
    extends: "Error",
    params: "relationName: string",
  },
  {
    name: "RelationInvalidOnUpdateError",
    extends: "Error",
    params: "sheetName: string, relationName: string, value: string",
  },
  {
    name: "RelationIgnoredColumnError",
    extends: "Error",
    params:
      "sheetName: string, relationName: string, columnName: string, ignoredSheetName: string",
  },
  {
    name: "NestedWriteConnectNotFoundError",
    extends: "Error",
    params: "sheetName: string",
  },
  {
    name: "NestedWriteRelationNotFoundError",
    extends: "Error",
    params: "fieldName: string",
  },
  {
    name: "NestedWriteInvalidOperationError",
    extends: "Error",
    params: "relationName: string, operation: string, relationType: string",
  },
  { name: "NestedWriteWithoutRelationsError", extends: "Error", params: "" },
  {
    name: "NestedWriteTargetNotFoundError",
    extends: "Error",
    params: "sheetName: string, operation: string",
  },
  {
    name: "RelationOrderByUnsupportedTypeError",
    extends: "Error",
    params: "relationName: string, relationType: string",
  },
  {
    name: "RelationOrderByCountUnsupportedTypeError",
    extends: "Error",
    params: "relationName: string, relationType: string",
  },
  {
    name: "GassmaUndefinedValueError",
    extends: "Error",
    params: "path: string",
  },
  { name: "GassmaSkipInArrayError", extends: "Error", params: "path: string" },
  {
    name: "GassmaMissingArgumentError",
    extends: "Error",
    params: "argumentName: string",
  },
  {
    name: "GassmaUnknownArgumentError",
    extends: "Error",
    params: "argumentName: string, availableArguments: string[]",
  },
  {
    name: "GassmaInvalidValueError",
    extends: "Error",
    params: "argumentName: string, expected: string",
  },
  {
    name: "GassmaRelationNotFoundError",
    extends: "Error",
    params: "relationName: string, sheetName: string",
  },
  {
    name: "GassmaThroughRequiredError",
    extends: "Error",
    params: "relationName: string",
  },
  { name: "GassmaIncludeSelectConflictError", extends: "Error", params: "" },
  {
    name: "GassmaRelationDuplicateError",
    extends: "Error",
    params: "sheetName: string, field: string, value: unknown",
  },
  {
    name: "GassmaTransactionLockTimeoutError",
    extends: "Error",
    params: "maxWaitMs: number",
  },
  {
    name: "GassmaTransactionTimeoutError",
    extends: "Error",
    params: 'phase: "query" | "commit", timeoutMs: number, elapsedMs: number',
  },
  { name: "GassmaNestedTransactionError", extends: "Error", params: "" },
  {
    name: "GassmaTransactionRollbackError",
    extends: "Error",
    params: "backupSheetNames: string[]",
    members: ["readonly backupSheetNames: string[]"],
  },
];

export { errorClassDefinitions };
export type { ErrorClassDef };
