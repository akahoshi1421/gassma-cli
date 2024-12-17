import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaWhereUse } from "./gassmaWhereUse/oneGassmaWhereUse";

const getGassmaWhereUse = (
  dictYaml: Record<string, Record<string, unknown[]>>
) => {
  const whereUseDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const sheetContent = dictYaml[currentSheetName];
      const removedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre + getOneGassmaWhereUse(sheetContent, removedSpaceCurrentSheetName)
      );
    },
    ""
  );

  return whereUseDeclare;
};

export { getGassmaWhereUse };
