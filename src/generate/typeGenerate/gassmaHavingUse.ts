import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaHavingUse } from "./gassmaHavingUse/oneGassmaHavingUse";

const getGassmaHavingUse = (
  dictYaml: Record<string, Record<string, unknown[]>>,
) => {
  const havingUseDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const sheetContent = dictYaml[currentSheetName];
      const removedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre + getOneGassmaHavingUse(sheetContent, removedSpaceCurrentSheetName)
      );
    },
    "",
  );

  return havingUseDeclare;
};

export { getGassmaHavingUse };
