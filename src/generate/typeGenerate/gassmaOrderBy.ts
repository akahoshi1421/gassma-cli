import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaOrderBy } from "./gassmaOrderBy/oneGassmaOrderBy";
import type { RelationsConfig } from "../read/extractRelations";

const getGassmaOrderBy = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
  relations?: RelationsConfig,
) => {
  const orderByDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const sheetContent = dictYaml[currentSheetName];
      const removedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre +
        getOneGassmaOrderBy(
          sheetContent,
          schemaName,
          removedSpaceCurrentSheetName,
          relations,
        )
      );
    },
    "",
  );

  return orderByDeclare;
};

export { getGassmaOrderBy };
