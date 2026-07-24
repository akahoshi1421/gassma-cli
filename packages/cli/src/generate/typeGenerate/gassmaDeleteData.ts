import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaDeleteData } from "./gassmaDeleteManyData/oneGassmaDeleteManyData";

const getGassmaDeleteData = (
  sheetNames: string[],
  schemaName: string,
  strict?: boolean,
) => {
  const deleteManyData = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre +
      getOneGassmaDeleteData(schemaName, removedSpaceCurrentSheetName, strict)
    );
  }, "");

  return deleteManyData;
};

export { getGassmaDeleteData };
