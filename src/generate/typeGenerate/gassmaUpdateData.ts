import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaUpdateData } from "./gassmaUpdateData/oneGassmaUpdateData";

const getGassmaUpdateData = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
  strict?: boolean,
) => {
  const updateDataDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const removedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre +
        getOneGassmaUpdateData(
          schemaName,
          removedSpaceCurrentSheetName,
          dictYaml[currentSheetName],
          strict,
        )
      );
    },
    "",
  );

  return updateDataDeclare;
};

export { getGassmaUpdateData };
