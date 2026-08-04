import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaFindResult } from "./gassmaFindResult/oneGassmaFindResult";
import type { OptionalRelationsConfig } from "../read/extractOptionalRelations";
import type { RelationsConfig } from "../read/extractRelations";

const getGassmaFindResult = (
  sheetNames: string[],
  schemaName: string,
  relations?: RelationsConfig,
  optionalRelations?: OptionalRelationsConfig,
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
        optionalRelations,
      )
    );
  }, "");

  return findResult;
};

export { getGassmaFindResult };
