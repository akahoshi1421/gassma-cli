import { getRemovedSpaceSheetNames } from "../util/getRemovedSpaceSheetName";
import { getOneGassmaAnyUse } from "./gassmaAnyUse/oneGassmaAnyUse";

const getGassmaAnyUse = (
  dictYaml: Record<string, Record<string, unknown[]>>
) => {
  const anyUseTypeDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const sheetContent = dictYaml[currentSheetName];
      const removeedSpaceCurrentSheetName =
        getRemovedSpaceSheetNames(currentSheetName);

      return (
        pre + getOneGassmaAnyUse(sheetContent, removeedSpaceCurrentSheetName)
      );
    },
    ""
  );

  return anyUseTypeDeclare;
};

export { getGassmaAnyUse };
