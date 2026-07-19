import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaUpdateData } from "./gassmaUpdateData/oneGassmaUpdateData";

const getGassmaUpdateData = (
  sheetNames: string[],
  schemaName: string,
  strict?: boolean,
) => {
  const updateDataDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre +
      getOneGassmaUpdateData(schemaName, removedSpaceCurrentSheetName, strict)
    );
  }, "");

  return updateDataDeclare;
};

export { getGassmaUpdateData };
