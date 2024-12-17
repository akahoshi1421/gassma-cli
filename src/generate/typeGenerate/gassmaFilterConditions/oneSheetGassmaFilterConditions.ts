import { getColumnType } from "../../util/getColumnType";

const getOneSheetGassmaFilterConditions = (
  sheetContent: Record<string, unknown[]>,
  sheetName: string
) => {
  const oneFilterConditions = Object.keys(sheetContent).reduce(
    (pre, columName) => {
      const columnTypes = sheetContent[columName];
      const now = getColumnType(columnTypes);
      const isOneType = columnTypes.length === 1;

      const oneFilterConditionsType = `
export type Gassma${sheetName}FilterConditions = {
  equals?: ${now};
  not?: ${now};
  in?: ${isOneType ? `${now}[]` : `(${now})[]`};
  notIn?: ${isOneType ? `${now}[]` : `(${now})[]`};
  lt?: ${now};
  lte?: ${now};
  gt?: ${now};
  gte?: ${now};
  contains?: string;
  startsWith?: string;
  endsWith?: string;
}
`;

      return pre + oneFilterConditionsType;
    },
    ""
  );

  return oneFilterConditions;
};

export { getOneSheetGassmaFilterConditions };
