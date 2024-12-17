import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaWhereUse } from "./gassmaWhereUse/oneGassmaWhereUse";

const getGassmaWhereUse = (
  dictYaml: Record<string, Record<string, unknown[]>>
) => {
  const whereUseDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const sheetContent = dictYaml[currentSheetName];
      const removeedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre + getOneGassmaWhereUse(sheetContent, removeedSpaceCurrentSheetName)
      );
    },
    ""
  );

  return whereUseDeclare;
};

export { getGassmaWhereUse };
