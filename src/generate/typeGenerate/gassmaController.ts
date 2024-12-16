import { getRemovedSpaceSheetNames } from "../util/getRemovedSpaceSheetName";
import { getOneGassmaController } from "./gassmaController/oneGassmaController";

const getGassmaController = (sheetNames: string[]) => {
  const controllerTypeDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removeedSpaceCurrentSheetName =
      getRemovedSpaceSheetNames(currentSheetName);

    return pre + getOneGassmaController(removeedSpaceCurrentSheetName);
  }, "");

  return controllerTypeDeclare;
};

export { getGassmaController };
