import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaUpdateSingleData } from "./gassmaUpdateData/oneGassmaUpdateSingleData";
import type { RelationsConfig } from "../read/extractRelations";

const getGassmaUpdateSingleData = (
  sheetNames: string[],
  schemaName: string,
  relations?: RelationsConfig,
  strict?: boolean,
) => {
  const updateSingleDataDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre +
      getOneGassmaUpdateSingleData(
        schemaName,
        removedSpaceCurrentSheetName,
        relations,
        strict,
      )
    );
  }, "");

  return updateSingleDataDeclare;
};

export { getGassmaUpdateSingleData };
