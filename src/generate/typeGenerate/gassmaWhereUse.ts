import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaWhereUse } from "./gassmaWhereUse/oneGassmaWhereUse";
import type { RelationsConfig } from "../read/extractRelations";

const getGassmaWhereUse = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
  relations?: RelationsConfig,
) => {
  const whereUseDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const sheetContent = dictYaml[currentSheetName];
      const removedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre +
        getOneGassmaWhereUse(
          sheetContent,
          schemaName,
          removedSpaceCurrentSheetName,
          relations,
        )
      );
    },
    "",
  );

  return whereUseDeclare;
};

export { getGassmaWhereUse };
