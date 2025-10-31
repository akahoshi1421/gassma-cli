import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaOrderBy } from "./gassmaOrderBy/oneGassmaOrderBy";

const getGassmaOrderBy = (
  dictYaml: Record<string, Record<string, unknown[]>>,
) => {
  const orderByDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const sheetContent = dictYaml[currentSheetName];
      const removedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre + getOneGassmaOrderBy(sheetContent, removedSpaceCurrentSheetName)
      );
    },
    "",
  );

  return orderByDeclare;
};

export { getGassmaOrderBy };
