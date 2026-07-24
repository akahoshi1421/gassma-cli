import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import type { RelationsConfig } from "../read/extractRelations";
import { getOneGassmaSelect } from "./gassmaSelect/oneGassmaSelect";
import { getOneGassmaNumberSelect } from "./gassmaSelect/oneGassmaNumberSelect";
import { getOneGassmaFindSelect } from "./gassmaSelect/oneGassmaFindSelect";

const getGassmaSelect = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
  relations?: RelationsConfig,
  strict?: boolean,
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
          strict,
        ) +
        getOneGassmaNumberSelect(
          sheetContent,
          schemaName,
          removedSpaceCurrentSheetName,
          strict,
        ) +
        getOneGassmaFindSelect(
          sheetContent,
          schemaName,
          removedSpaceCurrentSheetName,
          relations,
          strict,
        )
      );
    },
    "",
  );

  return selectDeclare;
};

export { getGassmaSelect };
