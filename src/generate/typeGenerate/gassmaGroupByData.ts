import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaGroupByData } from "./gassmaGroupByData/oneGassmaGroupByData";

const getGassmaGroupByData = (
  dictYaml: Record<string, Record<string, unknown[]>>
) => {
  const groupByDataDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const sheetContent = dictYaml[currentSheetName];
      const removedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre +
        getOneGassmaGroupByData(sheetContent, removedSpaceCurrentSheetName)
      );
    },
    ""
  );

  return groupByDataDeclare;
};

export { getGassmaGroupByData };
