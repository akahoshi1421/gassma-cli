import { getColumnType } from "../../util/getColumnType";
import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";
import { skipUnion } from "../util/skipUnion";

const getOneSheetGassmaFilterConditions = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
  strict?: boolean,
) => {
  const sk = skipUnion(strict);
  const oneFilterConditions = Object.keys(sheetContent).reduce(
    (pre, columnName) => {
      const columnTypes = sheetContent[columnName];
      const now = getColumnType(columnTypes);
      const isQuestionMark = columnName.at(-1) === "?";

      const removedSpaceCurrentColumnName =
        getRemovedCantUseVarChar(columnName);

      const isOneType = columnTypes.length === 1;

      const oneFilterConditionsType = `
export type Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}FilterConditions = {
  equals?: ${now}${isQuestionMark ? " | null" : ""} | Gassma.FieldRef${sk};
  not?: ${now}${isQuestionMark ? " | null" : ""}${sk};
  in?: ${isOneType ? `${now}[]` : `(${now})[]`}${sk};
  notIn?: ${isOneType ? `${now}[]` : `(${now})[]`}${sk};
  lt?: ${now} | Gassma.FieldRef${sk};
  lte?: ${now} | Gassma.FieldRef${sk};
  gt?: ${now} | Gassma.FieldRef${sk};
  gte?: ${now} | Gassma.FieldRef${sk};
  contains?: string | Gassma.FieldRef${sk};
  startsWith?: string | Gassma.FieldRef${sk};
  endsWith?: string | Gassma.FieldRef${sk};
  mode?: "default" | "insensitive"${sk};
};
`;

      return pre + oneFilterConditionsType;
    },
    "",
  );

  return oneFilterConditions;
};

export { getOneSheetGassmaFilterConditions };
