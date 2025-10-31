import { getColumnType } from "../../util/getColumnType";

const getOneGassmaCreateReturn = (
  sheetContent: Record<string, unknown[]>,
  sheetName: string,
) => {
  const oneCreateReturn = Object.keys(sheetContent).reduce(
    (pre, columnName) => {
      const columnTypes = sheetContent[columnName];

      const now = getColumnType(columnTypes);

      const isQuestionMark = columnName.at(-1) === "?";
      const removedQuestionMark = isQuestionMark
        ? columnName.substring(0, columnName.length - 1)
        : columnName;

      return `${pre} "${removedQuestionMark}": ${now}${isQuestionMark ? " | null" : ""};\n`;
    },
    `\nexport type Gassma${sheetName}CreateReturn = {\n`,
  );

  return `${oneCreateReturn}};\n`;
};

export { getOneGassmaCreateReturn };
