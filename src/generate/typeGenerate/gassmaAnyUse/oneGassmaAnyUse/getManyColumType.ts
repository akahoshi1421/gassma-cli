import { getOneColumnType } from "./getOneColumnType";

const getManyColumnType = (columnTypes: unknown[]) => {
  const oneColumnType = columnTypes.reduce((pre, oneType, index) => {
    const now =
      index === columnTypes.length - 1
        ? `${pre}${getOneColumnType(oneType)}`
        : `${pre}${getOneColumnType(oneType)} | `;

    return pre + now;
  }, "");

  return oneColumnType;
};

export { getManyColumnType };
