import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaController } from "./gassmaController/oneGassmaController";

const getGassmaController = (sheetNames: string[], schemaName: string) => {
  const controllerTypeDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre + getOneGassmaController(schemaName, removedSpaceCurrentSheetName)
    );
  }, "");

  return controllerTypeDeclare;
};

export { getGassmaController };
