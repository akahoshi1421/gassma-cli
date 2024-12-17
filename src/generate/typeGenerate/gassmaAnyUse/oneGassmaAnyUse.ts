import { getColumnType } from "../../util/getColumnType";

const getOneGassmaAnyUse = (
  sheetContent: Record<string, unknown[]>,
  sheetName: string
) => {
  const oneAnyUse = Object.keys(sheetContent).reduce((pre, columName) => {
    const columnTypes = sheetContent[columName];

    const now = getColumnType(columnTypes);

    const isQuestionMark = columName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columName.substring(0, columName.length - 1)
      : columName;
    const insertColumnName = isQuestionMark
      ? `"${removedQuestionMark}"?`
      : `"${removedQuestionMark}"`;

    return `${pre}  ${insertColumnName}: ${now};\n`;
  }, `\nexport type Gassma${sheetName}Use = {\n`);

  return `${oneAnyUse}};\n`;
};

export { getOneGassmaAnyUse };
