import { getColumnType } from "../../util/getColumnType";
import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";
import { skipUnion } from "../util/skipUnion";

const getOneGassmaHavingUse = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
  strict?: boolean,
) => {
  const sk = skipUnion(strict);
  const oneHavingUse = Object.keys(sheetContent).reduce((pre, columnName) => {
    const columnTypes = sheetContent[columnName];
    const now = getColumnType(columnTypes);
    const removedSpaceCurrentColumnName = getRemovedCantUseVarChar(columnName);

    const isQuestionMark = columnName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columnName.substring(0, columnName.length - 1)
      : columnName;

    return `${pre}  "${removedQuestionMark}"?: ${now}${isQuestionMark ? " | null" : ""} | Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}HavingCore${sk};\n`;
  }, `\nexport type Gassma${schemaName}${sheetName}HavingUse = {\n`);

  return `${oneHavingUse}
  AND?: Gassma${schemaName}${sheetName}HavingUse[] | Gassma${schemaName}${sheetName}HavingUse${sk};
  OR?: Gassma${schemaName}${sheetName}HavingUse[]${sk};
  NOT?: Gassma${schemaName}${sheetName}HavingUse[] | Gassma${schemaName}${sheetName}HavingUse${sk};
};
`;
};

export { getOneGassmaHavingUse };
