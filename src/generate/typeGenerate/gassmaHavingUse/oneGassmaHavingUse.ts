import { getColumnType } from "../../util/getColumnType";
import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";

const getOneGassmaHavingUse = (
  sheetContent: Record<string, unknown[]>,
  sheetName: string
) => {
  const oneHavingUse = Object.keys(sheetContent).reduce((pre, columnName) => {
    const columnTypes = sheetContent[columnName];
    const now = getColumnType(columnTypes);
    const removedSpaceCurrentColumnName = getRemovedCantUseVarChar(columnName);

    const isQuestionMark = columnName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columnName.substring(0, columnName.length - 1)
      : columnName;

    return `${pre}  "${removedQuestionMark}"?: ${now}${isQuestionMark ? " | null" : ""} | Gassma${sheetName}${removedSpaceCurrentColumnName}HavingCore;\n`;
  }, `\nexport type Gassma${sheetName}HavingUse = {\n`);

  return `${oneHavingUse}
  AND?: Gassma${sheetName}HavingUse[] | Gassma${sheetName}HavingUse;
  OR?: Gassma${sheetName}HavingUse[];
  NOT?: Gassma${sheetName}HavingUse[] | Gassma${sheetName}HavingUse;
};
`;
};

export { getOneGassmaHavingUse };
