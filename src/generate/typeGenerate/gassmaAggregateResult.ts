import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaAggregateResult } from "./gassmaAggregateResult/oneGassmaAggregateResult";

const getGassmaAggregateResult = (sheetNames: string[]) => {
  const aggregateResultDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return pre + getOneGassmaAggregateResult(removedSpaceCurrentSheetName);
  }, "");

  return aggregateResultDeclare;
};

export { getGassmaAggregateResult };
