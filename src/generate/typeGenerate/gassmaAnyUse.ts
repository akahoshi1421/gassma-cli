import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaAnyUse } from "./gassmaAnyUse/oneGassmaAnyUse";

const getGassmaAnyUse = (
  dictYaml: Record<string, Record<string, unknown[]>>
) => {
  const anyUseTypeDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const sheetContent = dictYaml[currentSheetName];
      const removeedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre + getOneGassmaAnyUse(sheetContent, removeedSpaceCurrentSheetName)
      );
    },
    ""
  );

  return anyUseTypeDeclare;
};

export { getGassmaAnyUse };
