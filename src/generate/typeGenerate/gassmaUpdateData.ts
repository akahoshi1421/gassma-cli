import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaUpdateData } from "./gassmaUpdateData/oneGassmaUpdateData";

const getGassmaUpdateData = (sheetNames: string[], schemaName: string) => {
  const updateDataDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre + getOneGassmaUpdateData(schemaName, removedSpaceCurrentSheetName)
    );
  }, "");

  return updateDataDeclare;
};

export { getGassmaUpdateData };
