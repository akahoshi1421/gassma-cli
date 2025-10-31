import { getColumnType } from "../../util/getColumnType";
import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";

const getOneSheetGassmaFilterConditions = (
  sheetContent: Record<string, unknown[]>,
  sheetName: string,
) => {
  const oneFilterConditions = Object.keys(sheetContent).reduce(
    (pre, columnName) => {
      const columnTypes = sheetContent[columnName];
      const now = getColumnType(columnTypes);
      const isQuestionMark = columnName.at(-1) === "?";

      const removedSpaceCurrentColumnName =
        getRemovedCantUseVarChar(columnName);

      const isOneType = columnTypes.length === 1;

      const oneFilterConditionsType = `
export type Gassma${sheetName}${removedSpaceCurrentColumnName}FilterConditions = {
  equals?: ${now}${isQuestionMark ? " | null" : ""};
  not?: ${now}${isQuestionMark ? " | null" : ""};
  in?: ${isOneType ? `${now}[]` : `(${now})[]`};
  notIn?: ${isOneType ? `${now}[]` : `(${now})[]`};
  lt?: ${now};
  lte?: ${now};
  gt?: ${now};
  gte?: ${now};
  contains?: string;
  startsWith?: string;
  endsWith?: string;
};
`;

      return pre + oneFilterConditionsType;
    },
    "",
  );

  return oneFilterConditions;
};

export { getOneSheetGassmaFilterConditions };
