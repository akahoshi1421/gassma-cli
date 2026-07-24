import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaAggregateField } from "./gassmaAggregateField/oneGassmaAggregateField";

const getGassmaAggregateField = (sheetNames: string[], schemaName: string) => {
  const aggregateFiledDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre + getOneGassmaAggregateField(schemaName, removedSpaceCurrentSheetName)
    );
  }, "");

  return aggregateFiledDeclare;
};

export { getGassmaAggregateField };
