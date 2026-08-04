import { getColumnType } from "../../util/getColumnType";
import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";
import { getRowTypeDoc } from "../tsdoc/docContext";

const getOneGassmaCreateReturn = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
) => {
  const clean = getRemovedCantUseVarChar(sheetName);
  const doc = getRowTypeDoc(schemaName, sheetName);

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
    `\n${doc}export type Gassma${schemaName}${clean}CreateReturn = {\n`,
  );

  return `${oneCreateReturn}};\n`;
};

export { getOneGassmaCreateReturn };
