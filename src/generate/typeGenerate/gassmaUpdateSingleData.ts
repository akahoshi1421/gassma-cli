import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaUpdateSingleData } from "./gassmaUpdateData/oneGassmaUpdateSingleData";
import type { RelationsConfig } from "../read/extractRelations";

const getGassmaUpdateSingleData = (
  sheetNames: string[],
  schemaName: string,
  relations?: RelationsConfig,
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
      )
    );
  }, "");

  return updateSingleDataDeclare;
};

export { getGassmaUpdateSingleData };
