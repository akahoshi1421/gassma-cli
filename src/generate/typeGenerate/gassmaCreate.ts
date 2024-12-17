import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaCreate } from "./gassmaCreate/oneGassmaCreate";

const getGassmaCreate = (sheetNames: string[]) => {
  const createTypeDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removeedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return pre + getOneGassmaCreate(removeedSpaceCurrentSheetName);
  }, "");

  return createTypeDeclare;
};

export { getGassmaCreate };
