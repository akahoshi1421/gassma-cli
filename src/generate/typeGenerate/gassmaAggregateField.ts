import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaAggregateField } from "./gassmaAggregateField/oneGassmaAggregateField";

const getGassmaAggregateField = (sheetNames: string[]) => {
  const aggregateFiledDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return pre + getOneGassmaAggregateField(removedSpaceCurrentSheetName);
  }, "");

  return aggregateFiledDeclare;
};

export { getGassmaAggregateField };
