import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaAnyUse } from "./gassmaAnyUse/oneGassmaAnyUse";

const getGassmaAnyUse = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
  optionalFields: Record<string, string[]> = {},
) => {
  const anyUseTypeDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const sheetContent = dictYaml[currentSheetName];
      const removedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre +
        getOneGassmaAnyUse(
          sheetContent,
          schemaName,
          removedSpaceCurrentSheetName,
          optionalFields[currentSheetName] ?? [],
        )
      );
    },
    "",
  );

  return anyUseTypeDeclare;
};

export { getGassmaAnyUse };
