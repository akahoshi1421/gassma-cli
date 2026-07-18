import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaFindFirstData } from "./gassmaFindData/oneGassmaFindFirstData";

const getGassmaFindFirstData = (
  sheetNames: string[],
  schemaName: string,
  strict?: boolean,
) => {
  const findFirstDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre +
      getOneGassmaFindFirstData(
        schemaName,
        removedSpaceCurrentSheetName,
        strict,
      )
    );
  }, "");

  return findFirstDeclare;
};

export { getGassmaFindFirstData };
