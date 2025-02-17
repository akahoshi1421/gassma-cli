import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaFindManyData } from "./gassmaFindManyData/oneGassmaFindManyData";

const getGassmaFindManyData = (sheetNames: string[]) => {
  const findManyDataDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return pre + getOneGassmaFindManyData(removedSpaceCurrentSheetName);
  }, "");

  return findManyDataDeclare;
};

export { getGassmaFindManyData };
