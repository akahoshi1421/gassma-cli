import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaUpsertSingleData } from "./gassmaUpsertData/oneGassmaUpsertSingleData";
import type { RelationsConfig } from "../read/extractRelations";

const getGassmaUpsertSingleData = (
  sheetNames: string[],
  relations?: RelationsConfig,
) => {
  const upsertSingleDataDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre +
      getOneGassmaUpsertSingleData(removedSpaceCurrentSheetName, relations)
    );
  }, "");

  return upsertSingleDataDeclare;
};

export { getGassmaUpsertSingleData };
