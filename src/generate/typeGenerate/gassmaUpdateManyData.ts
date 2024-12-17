import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaUpdateManyData } from "./gassmaUpdateManyData/oneGassmaUpdateManyData";

const getGassmaUpdateManyData = (sheetNames: string[]) => {
  const updateDataDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return pre + getOneGassmaUpdateManyData(removedSpaceCurrentSheetName);
  }, "");

  return updateDataDeclare;
};

export { getGassmaUpdateManyData };
