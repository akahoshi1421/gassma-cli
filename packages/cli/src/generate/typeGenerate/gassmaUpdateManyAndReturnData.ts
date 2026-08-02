import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaUpdateManyAndReturnData } from "./gassmaUpdateData/oneGassmaUpdateManyAndReturnData";

const getGassmaUpdateManyAndReturnData = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
  strict?: boolean,
) => {
  const updateManyAndReturnDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const removedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre +
        getOneGassmaUpdateManyAndReturnData(
          schemaName,
          removedSpaceCurrentSheetName,
          dictYaml[currentSheetName],
          strict,
        )
      );
    },
    "",
  );

  return updateManyAndReturnDeclare;
};

export { getGassmaUpdateManyAndReturnData };
