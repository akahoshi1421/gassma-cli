import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneSheetGassmaFilterConditions } from "./gassmaFilterConditions/oneSheetGassmaFilterConditions";

const getGassmaFilterCoditions = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
  strict?: boolean,
) => {
  const filterConditionsDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const sheetContent = dictYaml[currentSheetName];
      const removedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre +
        getOneSheetGassmaFilterConditions(
          sheetContent,
          schemaName,
          removedSpaceCurrentSheetName,
          strict,
        )
      );
    },
    "",
  );

  return filterConditionsDeclare;
};

export { getGassmaFilterCoditions };
