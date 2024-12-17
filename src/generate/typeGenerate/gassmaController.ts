import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaController } from "./gassmaController/oneGassmaController";

const getGassmaController = (sheetNames: string[]) => {
  const controllerTypeDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return pre + getOneGassmaController(removedSpaceCurrentSheetName);
  }, "");

  return controllerTypeDeclare;
};

export { getGassmaController };
