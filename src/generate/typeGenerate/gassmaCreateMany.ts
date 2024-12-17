import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaCreateMany } from "./gassmaCreateMany/oneGassmaCreateMany";

const getGassmaCreateMany = (sheetNames: string[]) => {
  const createManyTypeDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return pre + getOneGassmaCreateMany(removedSpaceCurrentSheetName);
  }, "");

  return createManyTypeDeclare;
};

export { getGassmaCreateMany };
