import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaCountResult } from "./gassmaCountResult/oneGassmaCountResult";

const getGassmaCountResult = (sheetNames: string[], schemaName: string) => {
  const countResultDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre + getOneGassmaCountResult(schemaName, removedSpaceCurrentSheetName)
    );
  }, "");

  return countResultDeclare;
};

export { getGassmaCountResult };
