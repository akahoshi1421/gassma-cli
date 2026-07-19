import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaUpsertSingleData } from "./gassmaUpsertData/oneGassmaUpsertSingleData";
import type { RelationsConfig } from "../read/extractRelations";

const getGassmaUpsertSingleData = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
  relations?: RelationsConfig,
  strict?: boolean,
) => {
  const upsertSingleDataDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const removedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre +
        getOneGassmaUpsertSingleData(
          schemaName,
          removedSpaceCurrentSheetName,
          dictYaml[currentSheetName],
          relations,
          strict,
          dictYaml,
        )
      );
    },
    "",
  );

  return upsertSingleDataDeclare;
};

export { getGassmaUpsertSingleData };
