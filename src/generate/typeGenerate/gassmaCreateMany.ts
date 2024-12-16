import { getRemovedSpaceSheetNames } from "../util/getRemovedSpaceSheetName";
import { getOneGassmaCreateMany } from "./gassmaCreateMany/oneGassmaCreateMany";

const getGassmaCreateMany = (sheetNames: string[]) => {
  const createManyTypeDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removeedSpaceCurrentSheetName =
      getRemovedSpaceSheetNames(currentSheetName);

    return pre + getOneGassmaCreateMany(removeedSpaceCurrentSheetName);
  }, "");

  return createManyTypeDeclare;
};

export { getGassmaCreateMany };
