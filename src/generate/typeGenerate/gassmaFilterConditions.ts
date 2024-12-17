import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneSheetGassmaFilterConditions } from "./gassmaFilterConditions/oneSheetGassmaFilterConditions";

const getGassmaFilterCoditions = (
  dictYaml: Record<string, Record<string, unknown[]>>
) => {
  const filterConditionsDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const sheetContent = dictYaml[currentSheetName];
      const removeedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre +
        getOneSheetGassmaFilterConditions(
          sheetContent,
          removeedSpaceCurrentSheetName
        )
      );
    },
    ""
  );

  return filterConditionsDeclare;
};

export { getGassmaFilterCoditions };
