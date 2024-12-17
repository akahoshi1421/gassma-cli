import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaCreate } from "./gassmaCreate/oneGassmaCreate";

const getGassmaCreate = (sheetNames: string[]) => {
  const createTypeDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return pre + getOneGassmaCreate(removedSpaceCurrentSheetName);
  }, "");

  return createTypeDeclare;
};

export { getGassmaCreate };
