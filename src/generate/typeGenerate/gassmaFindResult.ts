import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaFindResult } from "./gassmaFindResult/oneGassmaFindResult";

const getGassmaFindResult = (sheetNames: string[]) => {
  const findResult = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return pre + getOneGassmaFindResult(removedSpaceCurrentSheetName);
  }, "");

  return findResult;
};

export { getGassmaFindResult };
