import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaGroupByKeyOfBaseReturn } from "./gassmaGroupByKeyOfBaseReturn/oneGassmaGroupByKeyOfBaseReturn";

const getGassmaGroupByKeyOfBaseReturn = (sheetNames: string[]) => {
  const groupByKeyOfBaseReturn = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre + getOneGassmaGroupByKeyOfBaseReturn(removedSpaceCurrentSheetName)
    );
  }, "");

  return groupByKeyOfBaseReturn;
};

export { getGassmaGroupByKeyOfBaseReturn };
