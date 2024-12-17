import { getManyColumnType } from "./getColumnType/getManyColumType";
import { getOneColumnType } from "./getColumnType/getOneColumnType";

const getColumnType = (columnTypes: unknown[]) => {
  const columnType =
    columnTypes.length === 1
      ? `${getOneColumnType(columnTypes[0])}`
      : `${getManyColumnType(columnTypes)}`;

  return columnType;
};

export { getColumnType };
