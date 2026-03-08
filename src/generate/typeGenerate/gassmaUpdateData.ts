import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaUpdateData } from "./gassmaUpdateData/oneGassmaUpdateData";
import type { RelationsConfig } from "../read/extractRelations";

const getGassmaUpdateData = (
  sheetNames: string[],
  relations?: RelationsConfig,
) => {
  const updateDataDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre + getOneGassmaUpdateData(removedSpaceCurrentSheetName, relations)
    );
  }, "");

  return updateDataDeclare;
};

export { getGassmaUpdateData };
