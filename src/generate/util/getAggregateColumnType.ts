import { getOneAggregateColumnType } from "./getColumnType/aggregate/getOneAggregateColumnType";

const getAggregateColumnType = (columnTypes: unknown[]) => {
  const isAllTypeSame = columnTypes.every((oneColumType) =>
    getOneAggregateColumnType(oneColumType)
  );

  return isAllTypeSame ? getOneAggregateColumnType(columnTypes[0]) : "";
};

export { getAggregateColumnType };
