import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaOrderByWithAggregation } from "./gassmaOrderByWithAggregation/oneGassmaOrderByWithAggregation";

const getGassmaOrderByWithAggregation = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
  strict?: boolean,
) => {
  const orderByWithAggregationDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) => {
      const sheetContent = dictYaml[currentSheetName];
      const removedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre +
        getOneGassmaOrderByWithAggregation(
          sheetContent,
          schemaName,
          removedSpaceCurrentSheetName,
          strict,
        )
      );
    },
    "",
  );

  return orderByWithAggregationDeclare;
};

export { getGassmaOrderByWithAggregation };
