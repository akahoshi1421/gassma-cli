import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaUpdateSingleData } from "./gassmaUpdateData/oneGassmaUpdateSingleData";
import type { RelationsConfig } from "../read/extractRelations";

const getGassmaUpdateSingleData = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
  relations?: RelationsConfig,
  strict?: boolean,
) => {
  const updateSingleDataDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const removedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre +
        getOneGassmaUpdateSingleData(
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

  return updateSingleDataDeclare;
};

export { getGassmaUpdateSingleData };
