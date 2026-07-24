import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaAggregateData } from "./gassmaAggregateData/oneGassmaAggregateData";

const getGassmaAggregateData = (
  sheetNames: string[],
  schemaName: string,
  strict?: boolean,
) => {
  const aggregateDstaDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre +
      getOneGassmaAggregateData(
        schemaName,
        removedSpaceCurrentSheetName,
        strict,
      )
    );
  }, "");

  return aggregateDstaDeclare;
};

export { getGassmaAggregateData };
