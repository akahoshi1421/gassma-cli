import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaFind } from "./gassmaFind/oneGassmaFind";

const getGassmaSelect = (
  dictYaml: Record<string, Record<string, unknown[]>>
) => {
  const selectDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const sheetContent = dictYaml[currentSheetName];
      const removedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return pre + getOneGassmaFind(sheetContent, removedSpaceCurrentSheetName);
    },
    ""
  );

  return selectDeclare;
};

export { getGassmaSelect };
