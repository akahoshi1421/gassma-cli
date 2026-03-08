import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaDefaultFindResult } from "./gassmaDefaultFindResult/oneGassmaDefaultFindResult";

const getGassmaDefaultFindResult = (
  sheetNames: string[],
  schemaName: string,
) => {
  const defaultFindResult = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre +
      getOneGassmaDefaultFindResult(schemaName, removedSpaceCurrentSheetName)
    );
  }, "");

  return defaultFindResult;
};

export { getGassmaDefaultFindResult };
