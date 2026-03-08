import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaGroupByResult } from "./gassmaGroupByResult/oneGassmaGroupByResult";

const getGassmaGroupByResult = (sheetNames: string[], schemaName: string) => {
  const groupByResultDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre + getOneGassmaGroupByResult(schemaName, removedSpaceCurrentSheetName)
    );
  }, "");

  return groupByResultDeclare;
};

export { getGassmaGroupByResult };
