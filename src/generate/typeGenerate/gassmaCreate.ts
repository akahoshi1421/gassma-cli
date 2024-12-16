import { getRemovedSpaceSheetNames } from "../util/getRemovedSpaceSheetName";
import { getOneGassmaCreate } from "./gassmaCreate/oneGassmaCreate";

const getGassmaCreate = (sheetNames: string[]) => {
  const createTypeDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removeedSpaceCurrentSheetName =
      getRemovedSpaceSheetNames(currentSheetName);

    return pre + getOneGassmaCreate(removeedSpaceCurrentSheetName);
  }, "");

  return createTypeDeclare;
};

export { getGassmaCreate };
