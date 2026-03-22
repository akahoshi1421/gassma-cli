import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import type { RelationsConfig } from "../read/extractRelations";
import { getOneGassmaSelect } from "./gassmaSelect/oneGassmaSelect";
import { getOneGassmaFindSelect } from "./gassmaSelect/oneGassmaFindSelect";

const getGassmaSelect = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
  relations?: RelationsConfig,
) => {
  const selectDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const sheetContent = dictYaml[currentSheetName];
      const removedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre +
        getOneGassmaSelect(
          sheetContent,
          schemaName,
          removedSpaceCurrentSheetName,
        ) +
        getOneGassmaFindSelect(
          sheetContent,
          schemaName,
          removedSpaceCurrentSheetName,
          relations,
        )
      );
    },
    "",
  );

  return selectDeclare;
};

export { getGassmaSelect };
