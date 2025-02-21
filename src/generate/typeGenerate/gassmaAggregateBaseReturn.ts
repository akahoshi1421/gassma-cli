import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaAggregateBaseReturn } from "./gassmaAggregateBaseReturn/oneGassmaAggregateBaseReturn";

const getGassmaAggregateBaseReturn = (
  dictYaml: Record<string, Record<string, unknown[]>>
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
          removedSpaceCurrentSheetName
        )
      );
    },
    ""
  );

  return aggregateBaseReturnTypeDeclare;
};

export { getGassmaAggregateBaseReturn };
