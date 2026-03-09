import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaCountValue } from "./gassmaCountValue/oneGassmaCountValue";
import type { RelationsConfig } from "../read/extractRelations";

const getGassmaCountValue = (
  sheetNames: string[],
  schemaName: string,
  relations?: RelationsConfig,
) => {
  return sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre +
      getOneGassmaCountValue(
        schemaName,
        removedSpaceCurrentSheetName,
        relations,
      )
    );
  }, "");
};

export { getGassmaCountValue };
