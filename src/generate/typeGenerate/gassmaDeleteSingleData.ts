import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaDeleteSingleData } from "./gassmaDeleteManyData/oneGassmaDeleteSingleData";

const getGassmaDeleteSingleData = (sheetNames: string[]) => {
  const deleteSingleDataDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return pre + getOneGassmaDeleteSingleData(removedSpaceCurrentSheetName);
  }, "");

  return deleteSingleDataDeclare;
};

export { getGassmaDeleteSingleData };
