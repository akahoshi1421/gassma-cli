import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaController } from "./gassmaController/oneGassmaController";

const getGassmaController = (sheetNames: string[]) => {
  const controllerTypeDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removeedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return pre + getOneGassmaController(removeedSpaceCurrentSheetName);
  }, "");

  return controllerTypeDeclare;
};

export { getGassmaController };
