import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaInclude } from "./gassmaInclude/oneGassmaInclude";
import type { RelationsConfig } from "../read/extractRelations";

const getGassmaInclude = (
  sheetNames: string[],
  schemaName: string,
  relations?: RelationsConfig,
) => {
  return sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre +
      getOneGassmaInclude(schemaName, removedSpaceCurrentSheetName, relations)
    );
  }, "");
};

export { getGassmaInclude };
