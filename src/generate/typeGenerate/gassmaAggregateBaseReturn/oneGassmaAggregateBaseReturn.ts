import { getAggregateColumnType } from "../../util/getAggregateColumnType";
import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";

const getOneGassmaAggregateBaseReturn = (
  sheetContent: Record<string, unknown[]>,
  sheetName: string,
) => {
  const oneAggregateBaseReturn = Object.keys(sheetContent).reduce(
    (pre, columnName) => {
      const columnTypes = sheetContent[columnName];
      const now = getAggregateColumnType(columnTypes);
      if (now === "") return "";

      const removedSpaceCurrentColumnName =
        getRemovedCantUseVarChar(columnName);

      return `${pre}  "${removedSpaceCurrentColumnName}": ${now}\n`;
    },
    "",
  );

  return `\nexport type Gassma${sheetName}AggregateBaseReturn = {
${oneAggregateBaseReturn}};
`;
};

export { getOneGassmaAggregateBaseReturn };
