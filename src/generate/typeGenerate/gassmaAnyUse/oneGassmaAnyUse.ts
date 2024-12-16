import { getManyColumnType } from "./oneGassmaAnyUse/getManyColumType";
import { getOneColumnType } from "./oneGassmaAnyUse/getOneColumnType";

const getOneGassmaAnyUse = (
  sheetContent: Record<string, unknown[]>,
  sheetName: string
) => {
  const oneAnyUse = Object.keys(sheetContent).reduce((pre, columName) => {
    const columnTypes = sheetContent[columName];

    const now =
      columnTypes.length === 1
        ? `${getOneColumnType(columnTypes[0])}`
        : `${getManyColumnType(columnTypes)}`;

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
