import { getColumnType } from "../../util/getColumnType";
import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";

const getOneGassmaHavingUse = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
) => {
  const oneHavingUse = Object.keys(sheetContent).reduce((pre, columnName) => {
    const columnTypes = sheetContent[columnName];
    const now = getColumnType(columnTypes);
    const removedSpaceCurrentColumnName = getRemovedCantUseVarChar(columnName);

    const isQuestionMark = columnName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columnName.substring(0, columnName.length - 1)
      : columnName;

    return `${pre}  "${removedQuestionMark}"?: ${now}${isQuestionMark ? " | null" : ""} | Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}HavingCore;\n`;
  }, `\nexport type Gassma${schemaName}${sheetName}HavingUse = {\n`);

  return `${oneHavingUse}
  AND?: Gassma${schemaName}${sheetName}HavingUse[] | Gassma${schemaName}${sheetName}HavingUse;
  OR?: Gassma${schemaName}${sheetName}HavingUse[];
  NOT?: Gassma${schemaName}${sheetName}HavingUse[] | Gassma${schemaName}${sheetName}HavingUse;
};
`;
};

export { getOneGassmaHavingUse };
