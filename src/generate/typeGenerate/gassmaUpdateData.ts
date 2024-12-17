import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaUpdateData } from "./gassmaUpdateData/oneGassmaUpdateData";

const getGassmaUpdateData = (sheetNames: string[]) => {
  const updateDataDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return pre + getOneGassmaUpdateData(removedSpaceCurrentSheetName);
  }, "");

  return updateDataDeclare;
};

export { getGassmaUpdateData };
