type ErrorClassDef = {
  name: string;
  extends: string;
  params: string;
};

const errorClassDefinitions: ErrorClassDef[] = [
  {
    name: "GassmaSkipNegativeError",
    extends: "Error",
    params: "value: number",
  },
  {
    name: "GassmaLimitNegativeError",
    extends: "Error",
    params: "value: number",
  },
  { name: "NotFoundError", extends: "Error", params: "" },
  { name: "GassmaFindSelectOmitConflictError", extends: "Error", params: "" },
  { name: "GassmaInValidColumnValueError", extends: "Error", params: "" },
  { name: "GassmaGroupByHavingDontWriteByError", extends: "Error", params: "" },
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
    name: "GassmaRelationNotFoundError",
    extends: "Error",
    params: "relationName: string, sheetName: string",
  },
  {
    name: "GassmaTargetSheetNotFoundError",
    extends: "Error",
    params: "targetSheetName: string",
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
];

export { errorClassDefinitions };
export type { ErrorClassDef };
