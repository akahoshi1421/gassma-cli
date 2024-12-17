import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaDeleteData } from "./gassmaDeleteManyData/oneGassmaDeleteManyData";

const getGassmaDeleteData = (sheetNames: string[]) => {
  const deleteManyData = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return pre + getOneGassmaDeleteData(removedSpaceCurrentSheetName);
  }, "");

  return deleteManyData;
};

export { getGassmaDeleteData };
