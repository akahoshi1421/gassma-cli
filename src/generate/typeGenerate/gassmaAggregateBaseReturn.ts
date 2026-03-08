import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaAggregateBaseReturn } from "./gassmaAggregateBaseReturn/oneGassmaAggregateBaseReturn";

const getGassmaAggregateBaseReturn = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
) => {
  const aggregateBaseReturnTypeDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const sheetContent = dictYaml[currentSheetName];
      const removedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre +
        getOneGassmaAggregateBaseReturn(
          sheetContent,
          schemaName,
          removedSpaceCurrentSheetName,
        )
      );
    },
    "",
  );

  return aggregateBaseReturnTypeDeclare;
};

export { getGassmaAggregateBaseReturn };
