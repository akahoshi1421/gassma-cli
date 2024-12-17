import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaCountData } from "./gassmaCountData/oneGassmaCountData";

const getGassmaCountData = (sheetNames: string[]) => {
  const countDataDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return pre + getOneGassmaCountData(removedSpaceCurrentSheetName);
  }, "");

  return countDataDeclare;
};

export { getGassmaCountData };
