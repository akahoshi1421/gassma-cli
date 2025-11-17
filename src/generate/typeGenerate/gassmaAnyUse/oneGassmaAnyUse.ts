import { getColumnType } from "../../util/getColumnType";

const getOneGassmaAnyUse = (
  sheetContent: Record<string, unknown[]>,
  sheetName: string,
) => {
  const oneAnyUse = Object.keys(sheetContent).reduce((pre, columnName) => {
    const columnTypes = sheetContent[columnName];

    const now = getColumnType(columnTypes);

    const isQuestionMark = columnName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columnName.substring(0, columnName.length - 1)
      : columnName;
    const insertColumnName = isQuestionMark
      ? `"${removedQuestionMark}"?`
      : `"${removedQuestionMark}"`;

    return `${pre}  ${insertColumnName}: ${now};\n`;
  }, `\ndeclare type Gassma${sheetName}Use = {\n`);

  return `${oneAnyUse}};\n`;
};

export { getOneGassmaAnyUse };
