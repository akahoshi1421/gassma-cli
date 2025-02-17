import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaSelect } from "./gassmaSelect/oneGassmaSelect";

const getGassmaSelect = (
  dictYaml: Record<string, Record<string, unknown[]>>
) => {
  const selectDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const sheetContent = dictYaml[currentSheetName];
      const removedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre + getOneGassmaSelect(sheetContent, removedSpaceCurrentSheetName)
      );
    },
    ""
  );

  return selectDeclare;
};

export { getGassmaSelect };
