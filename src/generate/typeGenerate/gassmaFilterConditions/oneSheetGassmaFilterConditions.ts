import { getColumnType } from "../../util/getColumnType";
import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";

const getOneSheetGassmaFilterConditions = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
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
declare type Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}FilterConditions = {
  equals?: ${now}${isQuestionMark ? " | null" : ""} | Gassma.FieldRef;
  not?: ${now}${isQuestionMark ? " | null" : ""};
  in?: ${isOneType ? `${now}[]` : `(${now})[]`};
  notIn?: ${isOneType ? `${now}[]` : `(${now})[]`};
  lt?: ${now} | Gassma.FieldRef;
  lte?: ${now} | Gassma.FieldRef;
  gt?: ${now} | Gassma.FieldRef;
  gte?: ${now} | Gassma.FieldRef;
  contains?: string | Gassma.FieldRef;
  startsWith?: string | Gassma.FieldRef;
  endsWith?: string | Gassma.FieldRef;
  mode?: "default" | "insensitive";
};
`;

      return pre + oneFilterConditionsType;
    },
    "",
  );

  return oneFilterConditions;
};

export { getOneSheetGassmaFilterConditions };
