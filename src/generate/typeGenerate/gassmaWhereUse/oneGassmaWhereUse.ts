import { getColumnType } from "../../util/getColumnType";
import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";

const getOneGassmaWhereUse = (
  sheetContent: Record<string, unknown[]>,
  sheetName: string,
) => {
  const oneWhereUse = Object.keys(sheetContent).reduce((pre, columnName) => {
    const columnTypes = sheetContent[columnName];
    const now = getColumnType(columnTypes);
    const removedSpaceCurrentColumnName = getRemovedCantUseVarChar(columnName);

    const isQuestionMark = columnName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columnName.substring(0, columnName.length - 1)
      : columnName;

    return `${pre}  "${removedQuestionMark}"?: ${now}${isQuestionMark ? " | null" : ""} | Gassma${sheetName}${removedSpaceCurrentColumnName}FilterConditions;\n`;
  }, `\ndeclare type Gassma${sheetName}WhereUse = {\n`);

  return `${oneWhereUse}
  AND?: Gassma${sheetName}WhereUse[] | Gassma${sheetName}WhereUse;
  OR?: Gassma${sheetName}WhereUse[];
  NOT?: Gassma${sheetName}WhereUse[] | Gassma${sheetName}WhereUse;
};
`;
};

export { getOneGassmaWhereUse };
