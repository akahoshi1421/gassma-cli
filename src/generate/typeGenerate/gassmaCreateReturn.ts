import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaCreateReturn } from "./gassmaCreateReturn/oneGassmaCreateReturn";

const getGassmaCreateReturn = (
  dictYaml: Record<string, Record<string, unknown[]>>,
) => {
  const createReturnTypeDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const sheetContent = dictYaml[currentSheetName];
      const removedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre +
        getOneGassmaCreateReturn(sheetContent, removedSpaceCurrentSheetName)
      );
    },
    "",
  );

  return createReturnTypeDeclare;
};

export { getGassmaCreateReturn };
