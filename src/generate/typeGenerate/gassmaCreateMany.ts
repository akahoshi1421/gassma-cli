import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaCreateMany } from "./gassmaCreateMany/oneGassmaCreateMany";

const getGassmaCreateMany = (sheetNames: string[]) => {
  const createManyTypeDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removeedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return pre + getOneGassmaCreateMany(removeedSpaceCurrentSheetName);
  }, "");

  return createManyTypeDeclare;
};

export { getGassmaCreateMany };
