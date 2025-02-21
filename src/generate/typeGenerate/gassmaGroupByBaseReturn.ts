import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaGroupByBaseReturn } from "./gassmaGroupByBaseReturn/oneGassmaGroupByBaseReturn";

const getGassmaGroupByBaseReturn = (sheetNames: string[]) => {
  const groupByBaseReturn = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return pre + getOneGassmaGroupByBaseReturn(removedSpaceCurrentSheetName);
  }, "");

  return groupByBaseReturn;
};

export { getGassmaGroupByBaseReturn };
