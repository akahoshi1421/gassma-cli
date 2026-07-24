import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaCountData } from "./gassmaCountData/oneGassmaCountData";

const getGassmaCountData = (
  sheetNames: string[],
  schemaName: string,
  strict?: boolean,
) => {
  const countDataDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre +
      getOneGassmaCountData(schemaName, removedSpaceCurrentSheetName, strict)
    );
  }, "");

  return countDataDeclare;
};

export { getGassmaCountData };
