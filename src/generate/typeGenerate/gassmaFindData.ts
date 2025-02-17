import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaFindData } from "./gassmaFindData/oneGassmaFindData";

const getGassmaFindData = (
  dictYaml: Record<string, Record<string, unknown[]>>
) => {
  const findDeclare = Object.keys(dictYaml).reduce((pre, currentSheetName) => {
    const sheetContent = dictYaml[currentSheetName];
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre + getOneGassmaFindData(sheetContent, removedSpaceCurrentSheetName)
    );
  }, "");

  return findDeclare;
};

export { getGassmaFindData };
