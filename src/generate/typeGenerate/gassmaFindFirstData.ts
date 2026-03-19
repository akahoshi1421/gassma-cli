import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaFindFirstData } from "./gassmaFindData/oneGassmaFindFirstData";

const getGassmaFindFirstData = (sheetNames: string[], schemaName: string) => {
  const findFirstDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre + getOneGassmaFindFirstData(schemaName, removedSpaceCurrentSheetName)
    );
  }, "");

  return findFirstDeclare;
};

export { getGassmaFindFirstData };
