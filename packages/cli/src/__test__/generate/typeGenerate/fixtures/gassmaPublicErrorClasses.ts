/**
 * Snapshot of the error classes exported from gassma's `src/publicApi.ts`.
 *
 * The CLI cannot read the gassma repository, so this list is the agreed
 * contract between the two. Refresh it from a gassma checkout with:
 *
 *   grep -oE '^export const [A-Za-z]+' src/publicApi.ts \
 *     | sed 's/export const //' | grep -E 'Error$' | sort
 *
 * `gassmaPublicErrorClasses.test.ts` fails when the generated namespace and
 * this list drift apart in either direction.
 */
const gassmaPublicErrorClasses = [
  "GassmaAggregateAvgError",
  "GassmaAggregateAvgTypeError",
  "GassmaAggregateMaxError",
  "GassmaAggregateMinError",
  "GassmaAggregateSelectionRequiredError",
  "GassmaAggregateSumError",
  "GassmaAggregateSumTypeError",
  "GassmaAggregateTypeError",
  "GassmaAutoincrementInTransactionError",
  "GassmaAutoincrementNotConfiguredError",
  "GassmaFindFirstTakeError",
  "GassmaFindSelectOmitConflictError",
  "GassmaGroupByHavingDontWriteByError",
  "GassmaGroupByOrderByRequiredError",
  "GassmaInValidColumnValueError",
  "GassmaIncludeSelectConflictError",
  "GassmaInvalidLockError",
  "GassmaInvalidValueError",
  "GassmaLimitNegativeError",
  "GassmaMissingArgumentError",
  "GassmaNestedTransactionError",
  "GassmaRelationDuplicateError",
  "GassmaRelationNotFoundError",
  "GassmaSkipInArrayError",
  "GassmaSkipNegativeError",
  "GassmaThroughRequiredError",
  "GassmaTransactionLockRequiredError",
  "GassmaTransactionLockTimeoutError",
  "GassmaTransactionRollbackError",
  "GassmaTransactionTimeoutError",
  "GassmaUndefinedValueError",
  "GassmaUnknownArgumentError",
  "IncludeInvalidOptionTypeError",
  "IncludeSelectIncludeConflictError",
  "IncludeSelectOmitConflictError",
  "IncludeWithoutRelationsError",
  "NestedWriteConnectNotFoundError",
  "NestedWriteInvalidOperationError",
  "NestedWriteRelationNotFoundError",
  "NestedWriteTargetNotFoundError",
  "NestedWriteWithoutRelationsError",
  "NotFoundError",
  "RelationColumnNotFoundError",
  "RelationIgnoredColumnError",
  "RelationInvalidOnDeleteError",
  "RelationInvalidOnUpdateError",
  "RelationInvalidPropertyTypeError",
  "RelationInvalidTypeError",
  "RelationMissingPropertyError",
  "RelationOnDeleteRestrictError",
  "RelationOnUpdateRestrictError",
  "RelationOrderByCountUnsupportedTypeError",
  "RelationOrderByUnsupportedTypeError",
  "RelationSheetNotFoundError",
  "WhereRelationInvalidFilterError",
  "WhereRelationWithoutContextError",
];

export { gassmaPublicErrorClasses };
