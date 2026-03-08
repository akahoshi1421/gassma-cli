import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaFindResult } from "./gassmaFindResult/oneGassmaFindResult";

const getGassmaFindResult = (sheetNames: string[], schemaName: string) => {
  const findResult = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre + getOneGassmaFindResult(schemaName, removedSpaceCurrentSheetName)
    );
  }, "");

  return findResult;
};

export { getGassmaFindResult };
