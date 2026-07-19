import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaCreate } from "./gassmaCreate/oneGassmaCreate";
import type { RelationsConfig } from "../read/extractRelations";

const getGassmaCreate = (
  sheetNames: string[],
  schemaName: string,
  relations?: RelationsConfig,
  strict?: boolean,
) => {
  const createTypeDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre +
      getOneGassmaCreate(
        schemaName,
        removedSpaceCurrentSheetName,
        relations,
        strict,
      )
    );
  }, "");

  return createTypeDeclare;
};

export { getGassmaCreate };
