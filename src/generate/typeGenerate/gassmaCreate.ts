import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaCreate } from "./gassmaCreate/oneGassmaCreate";
import type { RelationsConfig } from "../read/extractRelations";

const getGassmaCreate = (sheetNames: string[], relations?: RelationsConfig) => {
  const createTypeDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return pre + getOneGassmaCreate(removedSpaceCurrentSheetName, relations);
  }, "");

  return createTypeDeclare;
};

export { getGassmaCreate };
