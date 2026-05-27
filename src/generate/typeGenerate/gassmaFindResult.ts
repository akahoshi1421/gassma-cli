import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaFindResult } from "./gassmaFindResult/oneGassmaFindResult";
import type { RelationsConfig } from "../read/extractRelations";

const getGassmaFindResult = (
  sheetNames: string[],
  schemaName: string,
  relations?: RelationsConfig,
) => {
  const findResult = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre +
      getOneGassmaFindResult(
        schemaName,
        removedSpaceCurrentSheetName,
        relations,
      )
    );
  }, "");

  return findResult;
};

export { getGassmaFindResult };
