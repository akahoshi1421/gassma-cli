import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaHavingCore } from "./gassmaHavingCore/oneGassmaHavingCore";

const getGassmaHavingCore = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
  strict?: boolean,
) => {
  const havingCoreDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const sheetContent = dictYaml[currentSheetName];
      const removedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre +
        getOneGassmaHavingCore(
          sheetContent,
          schemaName,
          removedSpaceCurrentSheetName,
          strict,
        )
      );
    },
    "",
  );

  return havingCoreDeclare;
};

export { getGassmaHavingCore };
