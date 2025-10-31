import { getOneAggregateColumnType } from "./getColumnType/aggregate/getOneAggregateColumnType";

const getAggregateColumnType = (columnTypes: unknown[]) => {
  const isAllTypeSame = columnTypes.every((oneColumnType) =>
    getOneAggregateColumnType(oneColumnType),
  );

  return isAllTypeSame ? getOneAggregateColumnType(columnTypes[0]) : "";
};

export { getAggregateColumnType };
